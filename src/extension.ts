'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('activate ...');

    let disposable = vscode.commands.registerCommand('heatseeker.sayHello', () => {
        vscode.window.showInformationMessage('Hello heatseeker!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('deactivate ...');
}
