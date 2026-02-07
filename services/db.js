let dbWorker = null;
let initPromise = null;

const DB_CONFIG = {
  from: 'inline',
  config: {
    serverMode: 'full',
    requestChunkSize: 4096,
    url: './recipes.sqlite'
  }
};

export async function initDb() {
  if (dbWorker) return dbWorker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { createDbWorker } = await import('sql.js-httpvfs');

      const workerScript = `
        import { createSQLiteThread } from "https://esm.sh/sql.js-httpvfs@1.2.1/dist/sqlite.worker.js?bundle";
        createSQLiteThread();
      `;
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const wasmUrl = 'https://esm.sh/sql.js-httpvfs@1.2.1/dist/sql-wasm.wasm';

      const worker = await createDbWorker([DB_CONFIG], workerUrl, wasmUrl);
      dbWorker = worker;
      return worker;
    } catch (error) {
      console.warn('ChefEmCasa: SQLite DB connection failed (recipes.sqlite missing or network error). App will work with local data.', error);
      return null;
    }
  })();

  return initPromise;
}

function mapResultsToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, index) => {
      let val = row[index];
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      obj[col] = val;
    });
    return obj;
  });
}

export const db = {
  getRecipes: async () => {
    const worker = await initDb();
    if (!worker) return [];
    try {
      const result = await worker.db.query('SELECT * FROM recipes ORDER BY createdAt DESC');
      return mapResultsToObjects(result);
    } catch (e) {
      console.error('SQL Query Error:', e);
      return [];
    }
  },

  getRecipeById: async (id) => {
    const worker = await initDb();
    if (!worker) return null;
    try {
      const result = await worker.db.query('SELECT * FROM recipes WHERE id = ?', [id]);
      const mapped = mapResultsToObjects(result);
      return mapped.length > 0 ? mapped[0] : null;
    } catch (e) {
      console.error('SQL Query Error:', e);
      return null;
    }
  }
};
let dbWorker = null;
let initPromise = null;

const DB_CONFIG = {
  from: "inline",
  config: {
    serverMode: "full",
    requestChunkSize: 4096,
    url: "./recipes.sqlite"
  }
};

export async function initDb() {
  if (dbWorker) return dbWorker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { createDbWorker } = await import("sql.js-httpvfs");

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
      console.warn("ChefEmCasa: SQLite DB connection failed (recipes.sqlite missing or network error). App will work with local data.", error);
      return null;
    }
  })();

  return initPromise;
}

function mapResultsToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, index) => {
      let val = row[index];
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try { val = JSON.parse(val); } catch (e) { }
      }
      obj[col] = val;
    });
    return obj;
  });
}

export const db = {
  getRecipes: async () => {
    const worker = await initDb();
    if (!worker) return [];
    try {
      const result = await worker.db.query(`SELECT * FROM recipes ORDER BY createdAt DESC`);
      return mapResultsToObjects(result);
    } catch (e) {
      console.error("SQL Query Error:", e);
      return [];
    }
  },

  getRecipeById: async (id) => {
    const worker = await initDb();
    if (!worker) return null;
    try {
      const result = await worker.db.query(`SELECT * FROM recipes WHERE id = ?`, [id]);
      const mapped = mapResultsToObjects(result);
      return mapped.length > 0 ? mapped[0] : null;
    } catch (e) {
      console.error("SQL Query Error:", e);
      return null;
    }
  }
};
let dbWorker = null;
let initPromise = null;

const DB_CONFIG = {
  from: "inline",
  config: {
    serverMode: "full",
    requestChunkSize: 4096, 
    url: "./recipes.sqlite" 
  }
};

export async function initDb() {
  if (dbWorker) return dbWorker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { createDbWorker } = await import("sql.js-httpvfs");

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
      console.warn("ChefEmCasa: SQLite DB connection failed (recipes.sqlite missing or network error). App will work with local data.", error);
      return null;
    }
  })();

  return initPromise;
}

function mapResultsToObjects(result) {
  if (!result || result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, index) => {
      let val = row[index];
      if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
        try {
          val = JSON.parse(val);
        } catch (e) { }
      }
      obj[col] = val;
    });
    return obj;
  });
}

export const db = {
  getRecipes: async () => {
    const worker = await initDb();
    if (!worker) return [];

    try {
      const result = await worker.db.query(`SELECT * FROM recipes ORDER BY createdAt DESC`);
      return mapResultsToObjects(result);
    } catch (e) {
      console.error("SQL Query Error:", e);
      return [];
    }
  },

  getRecipeById: async (id) => {
    const worker = await initDb();
    if (!worker) return null;

    try {
      const result = await worker.db.query(`SELECT * FROM recipes WHERE id = ?`, [id]);
      const mapped = mapResultsToObjects(result);
      return mapped.length > 0 ? mapped[0] : null;
    } catch (e) {
      console.error("SQL Query Error:", e);
      return null;
    }
  }
};
