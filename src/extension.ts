import * as vscode from 'vscode';
import { HelloWorldPanel } from './HelloWorldPanel';
import { SidebarProvider } from './SidebarProvider';
import { authenticate } from './authenticate';
import { TokenManager } from './TokenManager';

export function activate(context: vscode.ExtensionContext) {
	TokenManager.globalState = context.globalState;

	console.log("token is: ", TokenManager.getToken());

	const sidebarProvider = new SidebarProvider(context.extensionUri);

	const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	item.text = "$(add) Add Todo";
	item.command = "vstodo.addTodo";
	item.show();

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vstodo-sidebar",
			sidebarProvider
		)
	);

	context.subscriptions.push(vscode.commands.registerCommand('vstodo.helloWorld', () => {
		HelloWorldPanel.createOrShow(context.extensionUri);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vstodo.authenticate', () => {
		try {
			authenticate();
		} catch (err) {
			console.log(err)
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('vstodo.addTodo', () => {
		const { activeTextEditor } = vscode.window
		if (!activeTextEditor) {
			vscode.window.showInformationMessage("No active text editor");
			return;
		}

		const text = activeTextEditor.document.getText(activeTextEditor.selection);

		sidebarProvider._view?.webview.postMessage({
			type: "new-todo",
			value: text,
		});
	})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand("vstodo.askQuestion", async () => {
			const answer = await vscode.window.showInformationMessage("How was your day?", "good", "bad");

			if (answer === "bad") {
				vscode.window.showInformationMessage("Sorry to hear that.")
			} else {
				console.log({ answer });
			}
		}));

	context.subscriptions.push(vscode.commands.registerCommand('vstodo.refresh', async () => {
		/* 		HelloWorldPanel.kill();
				HelloWorldPanel.createOrShow(context.extensionUri); */

		await vscode.commands.executeCommand(
			"workbench.action.closeSidebar"
		);
		await vscode.commands.executeCommand(
			"workbench.view.extension.vstodo-sidebar-view"
		);
		setTimeout(() => {
			vscode.commands.executeCommand(
				"workbench.action.webview.openDeveloperTools"
			);
		}, 500);
	}));

}

export function deactivate() { }
