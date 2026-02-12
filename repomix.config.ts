// repomix.config.ts
import { defineConfig } from "repomix";

export default defineConfig({
  input: {
    maxFileSize: 52_428_800,
  },
  output: {
    filePath: "repomix-output.xml",
    style: "xml",
    parsableStyle: false,
    fileSummary: true,
    directoryStructure: true,
    files: true,
    removeComments: false,
    removeEmptyLines: false,
    compress: false,
    topFilesLength: 5,
    showLineNumbers: false,
    truncateBase64: false,
    copyToClipboard: false,
    includeFullDirectoryStructure: false,
    tokenCountTree: false,
    git: {
      sortByChanges: true,
      sortByChangesMaxCommits: 100,
      includeDiffs: false,
      includeLogs: false,
      includeLogsCount: 50,
    },
  },
  include: ["src/**/*"],
  ignore: {
    useGitignore: false,
    useDotIgnore: false,
    useDefaultPatterns: true,
    customPatterns: [],
  },
  security: {
    enableSecurityCheck: true,
  },
  tokenCount: {
    encoding: "o200k_base",
  },
});
