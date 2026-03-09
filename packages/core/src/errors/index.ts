export class OpenVizAIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenVizAIError";
  }
}

export class InvalidInputError extends OpenVizAIError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidInputError";
  }
}

export class LLMError extends OpenVizAIError {
  constructor(message: string) {
    super(message);
    this.name = "LLMError";
  }
}

export class ConfigError extends OpenVizAIError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
