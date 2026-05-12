-- CreateTable
CREATE TABLE "User" (
    "UserID" SERIAL NOT NULL,
    "FullName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(150) NOT NULL,
    "Password" VARCHAR(255) NOT NULL,
    "Role" TEXT NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'Active',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("UserID")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "CandidateID" SERIAL NOT NULL,
    "FullName" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(150) NOT NULL,
    "Phone" VARCHAR(20),
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("CandidateID")
);

-- CreateTable
CREATE TABLE "JobPosting" (
    "JobID" SERIAL NOT NULL,
    "PostedBy" INTEGER NOT NULL,
    "DeptName" VARCHAR(100) NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "Requirements" TEXT,
    "SalaryRange" VARCHAR(100),
    "StartDate" DATE NOT NULL,
    "EndDate" DATE NOT NULL,
    "JobType" VARCHAR(50) NOT NULL DEFAULT 'full-time',
    "ExperienceLevel" VARCHAR(50) NOT NULL DEFAULT 'fresher',
    "Location" VARCHAR(200) NOT NULL DEFAULT 'Hà Nội',
    "Headcount" INTEGER NOT NULL DEFAULT 1,
    "Status" TEXT NOT NULL DEFAULT 'Draft',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobPosting_pkey" PRIMARY KEY ("JobID")
);

-- CreateTable
CREATE TABLE "Application" (
    "AppID" SERIAL NOT NULL,
    "JobID" INTEGER NOT NULL,
    "CandidateID" INTEGER NOT NULL,
    "ManagedBy" INTEGER,
    "AppliedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "CV_File" VARCHAR(500),
    "Status" TEXT NOT NULL DEFAULT 'New',

    CONSTRAINT "Application_pkey" PRIMARY KEY ("AppID")
);

-- CreateTable
CREATE TABLE "Interview" (
    "InterviewID" SERIAL NOT NULL,
    "AppID" INTEGER NOT NULL,
    "InterviewerID" INTEGER NOT NULL,
    "InterviewDate" TIMESTAMP(3) NOT NULL,
    "Location" VARCHAR(200),
    "Type" TEXT NOT NULL,
    "ConfirmStatus" TEXT NOT NULL DEFAULT 'Pending',
    "TechnicalScore" INTEGER,
    "SoftScore" INTEGER,
    "AttitudeScore" INTEGER,
    "Result" TEXT NOT NULL DEFAULT 'Pending',
    "Feedback" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("InterviewID")
);

-- CreateTable
CREATE TABLE "Offer" (
    "OfferID" SERIAL NOT NULL,
    "AppID" INTEGER NOT NULL,
    "CreatedBy" INTEGER NOT NULL,
    "ApprovedBy" INTEGER,
    "BaseSalary" DECIMAL(15,2) NOT NULL,
    "Allowance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "StartDate" DATE NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'Pending',
    "DirectorNote" TEXT,
    "DecisionToken" VARCHAR(128),
    "DeclineReason" TEXT,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("OfferID")
);

-- CreateTable
CREATE TABLE "Probation" (
    "ProbationID" SERIAL NOT NULL,
    "OfferID" INTEGER NOT NULL,
    "ProbationerID" INTEGER NOT NULL,
    "SupervisorID" INTEGER,
    "StartDate" DATE NOT NULL,
    "EndDate" DATE NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'Ongoing',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Probation_pkey" PRIMARY KEY ("ProbationID")
);

-- CreateTable
CREATE TABLE "ProbationEvaluation" (
    "EvalID" SERIAL NOT NULL,
    "ProbationID" INTEGER NOT NULL,
    "SubmittedBy" INTEGER NOT NULL,
    "ApprovedBy" INTEGER,
    "KPIScore" INTEGER,
    "Comment" TEXT,
    "Recommendation" TEXT,
    "DirectorNote" TEXT,
    "Status" TEXT NOT NULL DEFAULT 'Draft',
    "SubmittedAt" TIMESTAMP(3),
    "ApprovedAt" TIMESTAMP(3),

    CONSTRAINT "ProbationEvaluation_pkey" PRIMARY KEY ("EvalID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_Email_key" ON "Candidate"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "uq_application" ON "Application"("JobID", "CandidateID");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_AppID_key" ON "Offer"("AppID");

-- CreateIndex
CREATE UNIQUE INDEX "Probation_OfferID_key" ON "Probation"("OfferID");

-- CreateIndex
CREATE UNIQUE INDEX "ProbationEvaluation_ProbationID_key" ON "ProbationEvaluation"("ProbationID");

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_PostedBy_fkey" FOREIGN KEY ("PostedBy") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_JobID_fkey" FOREIGN KEY ("JobID") REFERENCES "JobPosting"("JobID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_CandidateID_fkey" FOREIGN KEY ("CandidateID") REFERENCES "Candidate"("CandidateID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_ManagedBy_fkey" FOREIGN KEY ("ManagedBy") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_AppID_fkey" FOREIGN KEY ("AppID") REFERENCES "Application"("AppID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_InterviewerID_fkey" FOREIGN KEY ("InterviewerID") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_AppID_fkey" FOREIGN KEY ("AppID") REFERENCES "Application"("AppID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_CreatedBy_fkey" FOREIGN KEY ("CreatedBy") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_ApprovedBy_fkey" FOREIGN KEY ("ApprovedBy") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Probation" ADD CONSTRAINT "Probation_OfferID_fkey" FOREIGN KEY ("OfferID") REFERENCES "Offer"("OfferID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Probation" ADD CONSTRAINT "Probation_ProbationerID_fkey" FOREIGN KEY ("ProbationerID") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Probation" ADD CONSTRAINT "Probation_SupervisorID_fkey" FOREIGN KEY ("SupervisorID") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProbationEvaluation" ADD CONSTRAINT "ProbationEvaluation_ProbationID_fkey" FOREIGN KEY ("ProbationID") REFERENCES "Probation"("ProbationID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProbationEvaluation" ADD CONSTRAINT "ProbationEvaluation_SubmittedBy_fkey" FOREIGN KEY ("SubmittedBy") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ProbationEvaluation" ADD CONSTRAINT "ProbationEvaluation_ApprovedBy_fkey" FOREIGN KEY ("ApprovedBy") REFERENCES "User"("UserID") ON DELETE NO ACTION ON UPDATE NO ACTION;
