/*
  Warnings:

  - You are about to drop the column `form` on the `SubMenu` table. All the data in the column will be lost.
  - Added the required column `jsonForm` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Form] ADD [jsonForm] NVARCHAR(max) NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[SubMenu] DROP COLUMN [form];
ALTER TABLE [dbo].[SubMenu] ADD [formId] INT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
