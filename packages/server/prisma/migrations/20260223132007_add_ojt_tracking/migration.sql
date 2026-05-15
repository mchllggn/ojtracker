-- CreateTable
CREATE TABLE "OjtTracking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "totalHours" REAL NOT NULL,
    "dutyHoursPerDay" REAL NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "completedHours" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OjtTracking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OjtTracking_userId_key" ON "OjtTracking"("userId");

-- CreateTable
CREATE TABLE "DutyLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ojtTrackingId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hoursWorked" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DutyLog_ojtTrackingId_fkey" FOREIGN KEY ("ojtTrackingId") REFERENCES "OjtTracking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DutyLog_ojtTrackingId_idx" ON "DutyLog"("ojtTrackingId");
