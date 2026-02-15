import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { OPENAI_API_KEY } from "@config/secrets";
import { responseFormatter } from "../prompts/responseFormatterPrompt";
import { responseFormatterSchema } from "../config/zodSchema";

/**
 * This helper function transforms query results into a tabular format suitable
 * for display. All values are converted to strings to avoid type unions in the
 * schema. Null and undefined values are converted to empty strings.
 * 
 * Returns: {
 * columns: ['name', 'age', 'active'],
 * rows: [['John', '30', 'true'], ['Jane', '25', 'false']]
 * 
 */
export const formatData = (
  queryResult: Record<string, string | number | boolean | null | undefined>[],
) => {
  // Validate input - must be a non-empty array with valid first element
  if (
    !Array.isArray(queryResult) ||
    queryResult.length === 0 ||
    !queryResult[0] ||
    typeof queryResult[0] !== 'object'
  ) {
    return { columns: [], rows: [] };
  }

  const columns = Object.keys(queryResult[0]);
  const rows = queryResult.map((row) =>
    columns.map((col) => {
      const value = row[col];
      // Convert all values to strings - null/undefined become empty string
      return value === null || value === undefined ? '' : String(value);
    }),
  );

  return { columns, rows };
};

const prepareSampleData = (
  data: any,
) => {
   if(!data){
    return null;
   }

   const sample = data.slice(0, 2)
   return formatData(sample);
}



export const myLLMNode = async (state: any) => {
  const model = new ChatOpenAI({
    apiKey: OPENAI_API_KEY,
    model: "gpt-4.1-nano-2025-04-14", 
  });

  const userPrompt = state.userPrompt;
  const data = state.data;

  const sampleData = prepareSampleData(data);


  const humanMessage = new HumanMessage({
    content: userPrompt
  });

  const systemMessage = new SystemMessage(
    responseFormatter(userPrompt,sampleData)
  );

  const messages = [ systemMessage,humanMessage]

  const response = await model.withStructuredOutput(
    responseFormatterSchema
  ).invoke(messages);

  console.log(response);

  return { ...state, result: response };
};

