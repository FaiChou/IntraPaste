-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "fileName" TEXT,
    "fileSize" INTEGER,
    "fileType" TEXT,
    "filePath" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT
);
INSERT INTO "new_Card" ("content", "createdAt", "expiresAt", "id") SELECT "content", "createdAt", "expiresAt", "id" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
