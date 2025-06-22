-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modpack" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT,
    "minecraftVersion" TEXT,
    "modLoader" TEXT,
    "downloadCount" INTEGER,
    "lastUpdated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modpack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModpackMod" (
    "modpackId" TEXT NOT NULL,
    "modId" TEXT NOT NULL,

    CONSTRAINT "ModpackMod_pkey" PRIMARY KEY ("modpackId","modId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Platform_name_key" ON "Platform"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Modpack_platformId_externalId_key" ON "Modpack"("platformId", "externalId");

-- AddForeignKey
ALTER TABLE "Modpack" ADD CONSTRAINT "Modpack_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModpackMod" ADD CONSTRAINT "ModpackMod_modpackId_fkey" FOREIGN KEY ("modpackId") REFERENCES "Modpack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModpackMod" ADD CONSTRAINT "ModpackMod_modId_fkey" FOREIGN KEY ("modId") REFERENCES "Mod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
