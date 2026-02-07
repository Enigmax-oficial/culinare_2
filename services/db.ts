import { Recipe } from "../types";

let dbWorker: any = null;
let initPromise: Promise<any> | null = null;

// Using a relative path allows this to work regardless of the hosting subdirectory (GitHub Pages)
const DB_URL = "./example.sqlite3.js"; 

const DB_CONFIG = {
  from: "inline" as const,
  config: {
    serverMode: "full" as const,
    requestChunkSize: 4096, 
    url: DB_URL
  }
};

export async function initDb() {
  if (dbWorker) return dbWorker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Dynamically import to ensure the app loads even if this fails
      // @ts-ignore
      const { createDbWorker } = await import("sql.js-httpvfs");

      // Worker script using ESM import from CDN
      const workerScript = `
        import { createSQLiteThread } from "https://esm.sh/sql.js-httpvfs@1.2.1/dist/sqlite.worker.js?bundle";
        createSQLiteThread();
      `;
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const wasmUrl = "https://esm.sh/sql.js-httpvfs@1.2.1/dist/sql-wasm.wasm";

      const worker = await createDbWorker(
        [DB_CONFIG],
        workerUrl,
        wasmUrl
      );

      dbWorker = worker;
      return worker;
    } catch (error) {
      console.warn("ChefEmCasa: SQLite DB connection failed. App will work with local data.", error);
      return null;
    }
  })();

  return initPromise;
}

function mapResultsToObjects<T>(result: any): T[] {
  if (!result || result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, index: number) => {
      let val = row[index];
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          val = JSON.parse(val);
        } catch (e) { }
      }
      obj[col] = val;
    });
    return obj as T;
  });
}

export const db = {
  getRecipes: async (): Promise<Recipe[]> => {
    try {
      const worker = await initDb();
      if (!worker) return [];

      // We wrap the query in a try-catch because if the file is not a valid DB, this will throw
      const result = await worker.db.query(`SELECT * FROM recipes ORDER BY createdAt DESC`);
      return mapResultsToObjects<Recipe>(result);
    } catch (e) {
      console.warn("ChefEmCasa: Failed to query recipes from SQLite. Using local only.", e);
      return [];
    }
  },

  getRecipeById: async (id: string): Promise<Recipe | null> => {
    try {
      const worker = await initDb();
      if (!worker) return null;

      const result = await worker.db.query(`SELECT * FROM recipes WHERE id = ?`, [id]);
      const mapped = mapResultsToObjects<Recipe>(result);
      return mapped.length > 0 ? mapped[0] : null;
    } catch (e) {
      return null;
    }
  }
};