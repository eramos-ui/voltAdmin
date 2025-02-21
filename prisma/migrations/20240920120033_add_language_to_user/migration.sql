/*
  Warnings:

  - You are about to drop the column `formID` on the `SubMenu` table. All the data in the column will be lost.
  - Added the required column `language` to the `User` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[SubMenu] DROP COLUMN [formID];
ALTER TABLE [dbo].[SubMenu] ADD [formId] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[User] ADD [language] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
