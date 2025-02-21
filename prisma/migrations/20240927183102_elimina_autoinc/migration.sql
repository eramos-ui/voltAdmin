BEGIN TRY

BEGIN TRAN;

-- RedefineTables
BEGIN TRANSACTION;
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_email_key];
DECLARE @SQL NVARCHAR(MAX) = N''
SELECT @SQL += N'ALTER TABLE '
    + QUOTENAME(OBJECT_SCHEMA_NAME(PARENT_OBJECT_ID))
    + '.'
    + QUOTENAME(OBJECT_NAME(PARENT_OBJECT_ID))
    + ' DROP CONSTRAINT '
    + OBJECT_NAME(OBJECT_ID) + ';'
FROM SYS.OBJECTS
WHERE TYPE_DESC LIKE '%CONSTRAINT'
    AND OBJECT_NAME(PARENT_OBJECT_ID) = 'User'
    AND SCHEMA_NAME(SCHEMA_ID) = 'dbo'
EXEC sp_executesql @SQL
;
CREATE TABLE [dbo].[_prisma_new_User] (
    [id] INT NOT NULL,
    [dateModification] DATETIME2 NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [userModification] INT,
    [email] NVARCHAR(1000) NOT NULL,
    [avatar] NVARCHAR(max),
    [theme] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [language] NVARCHAR(1000) NOT NULL,
    [resetToken] NVARCHAR(1000),
    [resetTokenExpiry] DATETIME2,
    [roleId] INT NOT NULL,
    [phone] NVARCHAR(1000),
    [rut] NVARCHAR(1000),
    [valid] BIT NOT NULL CONSTRAINT [User_valid_df] DEFAULT 1,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id],[dateModification]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);
IF EXISTS(SELECT * FROM [dbo].[User])
    EXEC('INSERT INTO [dbo].[_prisma_new_User] ([avatar],[dateModification],[email],[id],[language],[name],[password],[phone],[resetToken],[resetTokenExpiry],[roleId],[rut],[theme],[userModification],[valid]) SELECT [avatar],[dateModification],[email],[id],[language],[name],[password],[phone],[resetToken],[resetTokenExpiry],[roleId],[rut],[theme],[userModification],[valid] FROM [dbo].[User] WITH (holdlock tablockx)');
DROP TABLE [dbo].[User];
EXEC SP_RENAME N'dbo._prisma_new_User', N'User';
COMMIT;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
