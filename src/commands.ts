import * as vscode from 'vscode';
import * as path from 'path';
import { kebabCase, pascalCase } from "case-anything";

export function createCustomElementCommand(context: vscode.ExtensionContext) {
  return async (uri: vscode.Uri) => {
    const ceName = await vscode.window.showInputBox({
      prompt: "Enter the new custom elements name"
    });
    const storedLanguage = context.workspaceState.get<string>("aurelia-utils-ce-language") || "ts";
    const language = await vscode.window.showQuickPick([storedLanguage, storedLanguage === "ts" ? "js" : "ts"], { ignoreFocusOut: true });
    context.workspaceState.update("aurelia-utils-ce-language", language);

    if (!ceName) {
      return;
    }

    const vmFile = vscode.Uri.parse('untitled:' + path.join(uri.fsPath, `${kebabCase(ceName)}.${language}`));
    vscode.workspace.openTextDocument(vmFile).then(document => {
      const edit = new vscode.WorkspaceEdit();
      edit.insert(vmFile, new vscode.Position(0, 0), `import { ${language === "ts" ? "autoinject" : "inject"} } from "aurelia-framework";

@${language === "ts" ? "autoinject" : "inject"}()
export class ${pascalCase(ceName)} {
  constructor() {}
}`);
      return vscode.workspace.applyEdit(edit).then(success => {
        if (success) {
          vscode.window.showTextDocument(document);
        } else {
          vscode.window.showInformationMessage('Error creating VM for custom element!');
        }
      });
    });

    const viewFile = vscode.Uri.parse('untitled:' + path.join(uri.fsPath, `${kebabCase(ceName)}.html`));
    vscode.workspace.openTextDocument(viewFile).then(document => {
      const edit = new vscode.WorkspaceEdit();
      edit.insert(viewFile, new vscode.Position(0, 0), `<template>

</template>`);
      return vscode.workspace.applyEdit(edit).then(success => {
        if (success) {
          vscode.window.showTextDocument(document);
        } else {
          vscode.window.showInformationMessage('Error creating View for custom element!');
        }
      });
    });
  };
}
