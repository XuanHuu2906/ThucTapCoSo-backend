BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [UserID] INT NOT NULL IDENTITY(1,1),
    [FullName] NVARCHAR(100) NOT NULL,
    [Email] VARCHAR(150) NOT NULL,
    [Password] VARCHAR(255) NOT NULL,
    [Role] NVARCHAR(1000) NOT NULL,
    [Status] NVARCHAR(1000) NOT NULL CONSTRAINT [User_Status_df] DEFAULT 'Active',
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [User_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([UserID]),
    CONSTRAINT [User_Email_key] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[Candidate] (
    [CandidateID] INT NOT NULL IDENTITY(1,1),
    [FullName] NVARCHAR(100) NOT NULL,
    [Email] VARCHAR(150) NOT NULL,
    [Phone] VARCHAR(20),
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Candidate_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Candidate_pkey] PRIMARY KEY CLUSTERED ([CandidateID]),
    CONSTRAINT [Candidate_Email_key] UNIQUE NONCLUSTERED ([Email])
);

-- CreateTable
CREATE TABLE [dbo].[JobPosting] (
    [JobID] INT NOT NULL IDENTITY(1,1),
    [PostedBy] INT NOT NULL,
    [DeptName] NVARCHAR(100) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Description] NTEXT,
    [Requirements] NTEXT,
    [SalaryRange] VARCHAR(100),
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [Status] NVARCHAR(1000) NOT NULL CONSTRAINT [JobPosting_Status_df] DEFAULT 'Draft',
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [JobPosting_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [JobPosting_pkey] PRIMARY KEY CLUSTERED ([JobID])
);

-- CreateTable
CREATE TABLE [dbo].[Application] (
    [AppID] INT NOT NULL IDENTITY(1,1),
    [JobID] INT NOT NULL,
    [CandidateID] INT NOT NULL,
    [ManagedBy] INT,
    [AppliedDate] DATETIME2 NOT NULL CONSTRAINT [Application_AppliedDate_df] DEFAULT CURRENT_TIMESTAMP,
    [CV_File] VARCHAR(500),
    [Status] NVARCHAR(1000) NOT NULL CONSTRAINT [Application_Status_df] DEFAULT 'New',
    CONSTRAINT [Application_pkey] PRIMARY KEY CLUSTERED ([AppID]),
    CONSTRAINT [uq_application] UNIQUE NONCLUSTERED ([JobID],[CandidateID])
);

-- CreateTable
CREATE TABLE [dbo].[Interview] (
    [InterviewID] INT NOT NULL IDENTITY(1,1),
    [AppID] INT NOT NULL,
    [InterviewerID] INT NOT NULL,
    [InterviewDate] DATETIME2 NOT NULL,
    [Location] VARCHAR(200),
    [Type] NVARCHAR(1000) NOT NULL,
    [ConfirmStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [Interview_ConfirmStatus_df] DEFAULT 'Pending',
    [TechnicalScore] TINYINT,
    [SoftScore] TINYINT,
    [AttitudeScore] TINYINT,
    [Result] NVARCHAR(1000) NOT NULL CONSTRAINT [Interview_Result_df] DEFAULT 'Pending',
    [Feedback] NTEXT,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Interview_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Interview_pkey] PRIMARY KEY CLUSTERED ([InterviewID])
);

-- CreateTable
CREATE TABLE [dbo].[Offer] (
    [OfferID] INT NOT NULL IDENTITY(1,1),
    [AppID] INT NOT NULL,
    [CreatedBy] INT NOT NULL,
    [ApprovedBy] INT,
    [BaseSalary] DECIMAL(15,2) NOT NULL,
    [Allowance] DECIMAL(15,2) NOT NULL CONSTRAINT [Offer_Allowance_df] DEFAULT 0,
    [StartDate] DATE NOT NULL,
    [Status] NVARCHAR(1000) NOT NULL CONSTRAINT [Offer_Status_df] DEFAULT 'Pending',
    [DirectorNote] NTEXT,
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Offer_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Offer_pkey] PRIMARY KEY CLUSTERED ([OfferID]),
    CONSTRAINT [Offer_AppID_key] UNIQUE NONCLUSTERED ([AppID])
);

-- CreateTable
CREATE TABLE [dbo].[Probation] (
    [ProbationID] INT NOT NULL IDENTITY(1,1),
    [OfferID] INT NOT NULL,
    [ProbationerID] INT NOT NULL,
    [SupervisorID] INT,
    [StartDate] DATE NOT NULL,
    [EndDate] DATE NOT NULL,
    [Status] NVARCHAR(1000) NOT NULL CONSTRAINT [Probation_Status_df] DEFAULT 'Ongoing',
    [CreatedAt] DATETIME2 NOT NULL CONSTRAINT [Probation_CreatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Probation_pkey] PRIMARY KEY CLUSTERED ([ProbationID]),
    CONSTRAINT [Probation_OfferID_key] UNIQUE NONCLUSTERED ([OfferID])
);

-- CreateTable
CREATE TABLE [dbo].[ProbationEvaluation] (
    [EvalID] INT NOT NULL IDENTITY(1,1),
    [ProbationID] INT NOT NULL,
    [SubmittedBy] INT NOT NULL,
    [ApprovedBy] INT,
    [KPIScore] TINYINT,
    [Comment] NTEXT,
    [Recommendation] NVARCHAR(1000),
    [DirectorNote] NTEXT,
    [Status] NVARCHAR(1000) NOT NULL CONSTRAINT [ProbationEvaluation_Status_df] DEFAULT 'Draft',
    [SubmittedAt] DATETIME2,
    [ApprovedAt] DATETIME2,
    CONSTRAINT [ProbationEvaluation_pkey] PRIMARY KEY CLUSTERED ([EvalID]),
    CONSTRAINT [ProbationEvaluation_ProbationID_key] UNIQUE NONCLUSTERED ([ProbationID])
);

-- AddForeignKey
ALTER TABLE [dbo].[JobPosting] ADD CONSTRAINT [JobPosting_PostedBy_fkey] FOREIGN KEY ([PostedBy]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_JobID_fkey] FOREIGN KEY ([JobID]) REFERENCES [dbo].[JobPosting]([JobID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_CandidateID_fkey] FOREIGN KEY ([CandidateID]) REFERENCES [dbo].[Candidate]([CandidateID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Application] ADD CONSTRAINT [Application_ManagedBy_fkey] FOREIGN KEY ([ManagedBy]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Interview] ADD CONSTRAINT [Interview_AppID_fkey] FOREIGN KEY ([AppID]) REFERENCES [dbo].[Application]([AppID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Interview] ADD CONSTRAINT [Interview_InterviewerID_fkey] FOREIGN KEY ([InterviewerID]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Offer] ADD CONSTRAINT [Offer_AppID_fkey] FOREIGN KEY ([AppID]) REFERENCES [dbo].[Application]([AppID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Offer] ADD CONSTRAINT [Offer_CreatedBy_fkey] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Offer] ADD CONSTRAINT [Offer_ApprovedBy_fkey] FOREIGN KEY ([ApprovedBy]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Probation] ADD CONSTRAINT [Probation_OfferID_fkey] FOREIGN KEY ([OfferID]) REFERENCES [dbo].[Offer]([OfferID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Probation] ADD CONSTRAINT [Probation_ProbationerID_fkey] FOREIGN KEY ([ProbationerID]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Probation] ADD CONSTRAINT [Probation_SupervisorID_fkey] FOREIGN KEY ([SupervisorID]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProbationEvaluation] ADD CONSTRAINT [ProbationEvaluation_ProbationID_fkey] FOREIGN KEY ([ProbationID]) REFERENCES [dbo].[Probation]([ProbationID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProbationEvaluation] ADD CONSTRAINT [ProbationEvaluation_SubmittedBy_fkey] FOREIGN KEY ([SubmittedBy]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ProbationEvaluation] ADD CONSTRAINT [ProbationEvaluation_ApprovedBy_fkey] FOREIGN KEY ([ApprovedBy]) REFERENCES [dbo].[User]([UserID]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
