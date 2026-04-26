BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[JobPosting] ADD [ExperienceLevel] VARCHAR(50) NOT NULL CONSTRAINT [JobPosting_ExperienceLevel_df] DEFAULT 'fresher',
[Headcount] INT NOT NULL CONSTRAINT [JobPosting_Headcount_df] DEFAULT 1,
[JobType] VARCHAR(50) NOT NULL CONSTRAINT [JobPosting_JobType_df] DEFAULT 'full-time',
[Location] NVARCHAR(200) NOT NULL CONSTRAINT [JobPosting_Location_df] DEFAULT 'Hà Nội';

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
