/*
  Warnings:

  - You are about to drop the column `formId` on the `SubMenu` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[SubMenu] DROP COLUMN [formId];
ALTER TABLE [dbo].[SubMenu] ADD [formID] NVARCHAR(1000);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
