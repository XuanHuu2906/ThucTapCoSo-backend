import type { Request, Response, NextFunction } from 'express';
import { probationService } from '../services/probation.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';

export class ProbationController {
  async getProbations(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const filters = { status: status as string };

      const probations = await probationService.getProbations(filters);
      sendSuccess(res, probations, 'Probations retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getProbationById(req: Request, res: Response, next: NextFunction) {
    try {
      const probationId = parseInt(req.params.id as string);
      const probation = await probationService.getProbationById(probationId);
      sendSuccess(res, probation, 'Probation retrieved successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createProbation(req: Request, res: Response, next: NextFunction) {
    try {
      const newProbation = await probationService.createProbation(req.body);
      sendSuccess(res, newProbation, 'Probation created successfully and Probationer account generated', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateProbation(req: Request, res: Response, next: NextFunction) {
    try {
      const probationId = parseInt(req.params.id as string);
      const updatedProbation = await probationService.updateProbation(probationId, req.body);
      sendSuccess(res, updatedProbation, 'Probation updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async evaluateProbation(req: Request, res: Response, next: NextFunction) {
    try {
      const probationId = parseInt(req.params.id as string);
      const userId = parseInt(req.user!.id);
      const userRole = req.user!.role;

      const evaluation = await probationService.evaluateProbation(probationId, userId, userRole, req.body);
      
      const message = req.body.isSubmit 
        ? 'Probation evaluation submitted for approval' 
        : 'Probation evaluation draft saved';
        
      sendSuccess(res, evaluation, message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async approveEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const probationId = parseInt(req.params.id as string);
      const { status, directorNote } = req.body;
      const userId = parseInt(req.user!.id);

      const evaluation = await probationService.approveEvaluation(probationId, userId, status, directorNote);
      sendSuccess(res, evaluation, `Probation evaluation ${status} successfully`, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

export const probationController = new ProbationController();
