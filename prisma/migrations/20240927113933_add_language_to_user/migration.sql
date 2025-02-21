/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `dateModification` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_pkey];
ALTER TABLE [dbo].[User] ALTER COLUMN [dateModification] DATETIME2 NOT NULL;
ALTER TABLE [dbo].[User] ADD CONSTRAINT User_pkey PRIMARY KEY CLUSTERED ([id],[dateModification]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
