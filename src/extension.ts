import * as vscode from 'vscode';
import * as path from 'path';
import { kebabCase, pascalCase } from "case-anything";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('aurelia-utils.createCustomElement', async (uri: vscode.Uri) => {
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
      edit.insert(vmFile, new vscode.Position(0, 0), `import { autoinject } from "aurelia-framework";

@autoinject()
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
					vscode.window.showInformationMessage('Error creating VM for custom element!');
				}
			});
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
