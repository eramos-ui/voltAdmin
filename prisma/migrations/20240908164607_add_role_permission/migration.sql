BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[RoleMenuPermissions] (
    [roleId] INT NOT NULL,
    [menuId] INT NOT NULL,
    [subMenuId] INT NOT NULL,
    CONSTRAINT [RoleMenuPermissions_pkey] PRIMARY KEY CLUSTERED ([roleId],[menuId],[subMenuId])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
