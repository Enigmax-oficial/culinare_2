import { Recipe } from "../types";
// @ts-ignore
import initSqlJs from 'sql.js';

let dbInstance: any = null;
let initPromise: Promise<any> | null = null;

const CREATE_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT,
  prepTime INTEGER,
  cookTime INTEGER,
  difficulty TEXT,
  ingredients TEXT, -- JSON
  steps TEXT, -- JSON
  authorId TEXT,
  authorName TEXT,
  createdAt INTEGER,
  rating REAL,
  ratingCount INTEGER,
  status TEXT,
  comments TEXT -- JSON
);
`;

export async function initDb() {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const SQL = await initSqlJs({
        // Locate the wasm file from a CDN to avoid needing to copy it to dist/ or handle fs issues
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
      });

      let buffer: ArrayBuffer | undefined;

      try {
        // Fetch the database file provided in the root
        // We look for example.sqlite3.js which is likely a renamed .db file or similar in this context
        // If running via Vite, it should be in public or served relative
        let dbUrl = './example.sqlite3.js';
        try {
            // Try to resolve relative to module if possible (Standard ESM/Vite)
            // This points to the parent directory (root) from services/
            dbUrl = new URL('../example.sqlite3.js', import.meta.url).href;
        } catch (e) {
            // Fallback for environments where import.meta.url might be problematic
             try {
                dbUrl = new URL('./example.sqlite3.js', window.location.href).href;
             } catch(e2) {
                console.warn("Failed to construct absolute DB URL, using relative.");
             }
        }

        const response = await fetch(dbUrl);
        if (response.ok) {
          buffer = await response.arrayBuffer();
        }
      } catch (e) {
        console.warn("Could not fetch initial DB file, starting with empty in-memory DB.", e);
      }
      
      // Create database from buffer if available, otherwise new empty DB
      dbInstance = buffer ? new SQL.Database(new Uint8Array(buffer)) : new SQL.Database();
      
      // Ensure schema exists (fixes 'no such table' error)
      dbInstance.run(CREATE_TABLE_SQL);

      // Check if table is empty, if so, seed it
      try {
        const res = dbInstance.exec("SELECT count(*) FROM recipes");
        if (res[0].values[0][0] === 0) {
          console.log("Seeding in-memory SQL database...");
          seedDatabase(dbInstance);
        }
      } catch (e) {
        console.warn("Error checking/seeding DB:", e);
      }
      
      console.log("ChefEmCasa: Database loaded successfully via sql.js");
      
      return dbInstance;
    } catch (error) {
      console.warn("ChefEmCasa: SQLite DB connection failed. App will work with local data.", error);
      return null;
    }
  })();

  return initPromise;
}

function seedDatabase(db: any) {
  const stmt = db.prepare(`
    INSERT INTO recipes (
      id, title, description, image, category, prepTime, cookTime, difficulty, 
      ingredients, steps, authorId, authorName, createdAt, rating, ratingCount, status, comments
    ) VALUES (
      $id, $title, $description, $image, $category, $prepTime, $cookTime, $difficulty, 
      $ingredients, $steps, $authorId, $authorName, $createdAt, $rating, $ratingCount, $status, $comments
    )
  `);

  // Sample data to make the app look alive immediately
  const seeds = [
    {
      $id: 'sql-1',
      $title: 'Risoto de Cogumelos (Comunitário)',
      $description: 'Um clássico italiano cremoso e cheio de sabor, vindo diretamente do banco de dados da comunidade.',
      $image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=1000&auto=format&fit=crop',
      $category: 'Jantar',
      $prepTime: 10,
      $cookTime: 30,
      $difficulty: 'Médio',
      $ingredients: JSON.stringify([
        { id: '1', name: 'Arroz arbóreo' },
        { id: '2', name: 'Cogumelos frescos' },
        { id: '3', name: 'Caldo de legumes' },
        { id: '4', name: 'Vinho branco' }
      ]),
      $steps: JSON.stringify([
        { id: '1', text: 'Refogue os cogumelos na manteiga.' },
        { id: '2', text: 'Adicione o arroz e o vinho branco, mexendo sempre.' },
        { id: '3', text: 'Vá colocando o caldo aos poucos até atingir o ponto.' }
      ]),
      $authorId: 'community-1',
      $authorName: 'Chef Community',
      $createdAt: Date.now(),
      $rating: 4.9,
      $ratingCount: 42,
      $status: 'verified',
      $comments: JSON.stringify([])
    }
  ];

  seeds.forEach(s => stmt.run(s));
  stmt.free();
}

function mapResultsToObjects<T>(result: { columns: string[], values: any[][] }): T[] {
  if (!result || !result.values) return [];
  
  const columns = result.columns;
  const values = result.values;
  
  return values.map((row: any[]) => {
    const obj: any = {};
    columns.forEach((col: string, index: number) => {
      let val = row[index];
      // Try to parse JSON strings if they look like arrays/objects
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
    const database = await initDb();
    if (!database) return [];

    try {
      // exec returns an array of result objects
      const res = database.exec("SELECT * FROM recipes ORDER BY createdAt DESC");
      if (res.length > 0) {
        return mapResultsToObjects<Recipe>(res[0]);
      }
      return [];
    } catch (e) {
      console.error("SQL Query Error (getRecipes):", e);
      return [];
    }
  },

  getRecipeById: async (id: string): Promise<Recipe | null> => {
    const database = await initDb();
    if (!database) return null;

    try {
      // Use parameter binding for safety
      const res = database.exec("SELECT * FROM recipes WHERE id = $id", { $id: id });
      
      if (res.length > 0) {
        const mapped = mapResultsToObjects<Recipe>(res[0]);
        return mapped.length > 0 ? mapped[0] : null;
      }
      return null;
    } catch (e) {
      console.error("SQL Query Error (getRecipeById):", e);
      return null;
    }
  }
};