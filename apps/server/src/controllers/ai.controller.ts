import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS_CODE, successResponse } from '@utils/index';
import { createSampleLangGraph } from '@services/AI/graph/sampleLangGraph';

class AIController {
  public async generateAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const prompt = req.body.prompt;
      const data = req.body.data;
      const graph = await createSampleLangGraph(prompt,data);
     const result = await graph.invoke({
      userPrompt: prompt,
      data:data
     });
      return successResponse(res, HTTP_STATUS_CODE.OK,'embedding generated',{ result: result.result });
    } catch (error) {
      next(error);
    }
  }
}

export default new AIController();

