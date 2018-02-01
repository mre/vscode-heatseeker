'use strict'
import * as cp from 'child_process'
import * as http from 'http'
import * as vscode from 'vscode'

export function activate(ctx: vscode.ExtensionContext) {
    console.log('activate ...')

    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        applyHeatMap()
    })

    vscode.workspace.onDidChangeConfiguration(function (event) {
        if (!event.affectsConfiguration("heatseeker")) {
            return
        }
        // TODO: Update host and opacity in the color function.
    })

    ctx.subscriptions.push(vscode.commands.registerCommand(
        'heatseeker.applyHeatMap', applyHeatMap))


    // TODO: Do git diff and find out where the lines have been moved.
    // vscode.workspace.onDidSaveTextDocument(event => {
    //     console.log("workspace.onDidSaveTextDocument");
    // })
    // vscode.workspace.onWillSaveTextDocument(event => {
    //     console.log("workspace.onWillSaveTextDocument");
    // })
}

export function deactivate() {
    console.log('deactivate ...')
}

function applyHeatMap() {
    let editor = vscode.window.activeTextEditor
    if (!editor) {
        return
    }

    let workspaceRoot = vscode.workspace.rootPath
    let configuration = vscode.workspace.getConfiguration('heatseeker')

    let host: string = configuration["host"]
    if (host === "") {
        vscode.window.showInformationMessage(
            "missing configuration: heatseeker.host")
        return
    }

    // Skip files that do not belong to the project (e.g. the User Settings)
    if (!editor.document.uri.fsPath.startsWith(workspaceRoot)) {
        return
    }

    let project = workspaceRoot.substr(workspaceRoot.lastIndexOf("/") + 1)
    let commit = getCurrentCommit(workspaceRoot)
    let filename = editor.document.uri.fsPath.substr(workspaceRoot.length + 1)

    let url = `${host}/api/v1/${project}/${commit}/${filename}`

    asyncRequest(url, function (data) {
        let response = JSON.parse(data)
        colorCurrentDocument(editor, response.linecount)
    })
}

// It's save to assume that the reponse will not change for a commit.
var requestCache = new Object()
function asyncRequest(url: string, callback: (data: string) => void) {
    let data = requestCache[url]
    if (data) {
        callback(data)
        return
    }

    console.log(`asyncRequest: ${url}`)
    http.get(url, function (message) {
        let data = ""

        message.on("data", function (chunk) {
            data += chunk
        })

        message.on("end", function () {
            requestCache[url] = data
            callback(data)
        })
    }).on("error", function (err) {
        vscode.window.showInformationMessage(err.message)
    })
}

function getCurrentCommit(path: string): string {
    console.log(`getCurrentCommit: ${path}`)
    let buffer = cp.execSync(`git -C "${path}" rev-parse HEAD`)
    return buffer.toString().trim()
}

function colorCurrentDocument(editor: vscode.TextEditor, hitCount: number[]) {
    if (hitCount.length == 0) {
        return
    }

    let maxHitCount = Math.max.apply(Math, hitCount)
    if (maxHitCount == 0) {
        // guard against an array of zeros
        maxHitCount = 1
    }

    // color all lines based on the given data
    for (let i = 0; i < hitCount.length; i++) {
        let heat = hitCount[i] / maxHitCount

        // // Don't color e.g. comments or empty lines
        if (heat < 0) {
            continue
        }

        let decoration = vscode.window.createTextEditorDecorationType({
            backgroundColor: heat2color(heat),
            isWholeLine: true
        })

        let line = new vscode.Range(i, 0, i, 0)

        editor.setDecorations(decoration, [line])
    }

    // color all remainig lines below that blue (if any)
    for (let i = hitCount.length; i < editor.document.lineCount; i++) {
        let blueBackground = vscode.window.createTextEditorDecorationType({
            backgroundColor: heat2color(0),
            isWholeLine: true
        })
        let line = new vscode.Range(i, 0, i, 0)
        editor.setDecorations(blueBackground, [line])
    }
}

function heat2color(heat: number): string {
    // rgba does not support floating point values, so round them.
    let red = Math.round(255 * heat)
    let blue = Math.round(255 * (1 - heat))

    let configuration = vscode.workspace.getConfiguration('heatseeker')
    let opacity: number = configuration.background.opacity
    if (opacity < 0) {
        opacity = 0
    } else if (opacity > 1) {
        opacity = 1
    }

    let res = `rgba(${red}, 63, ${blue}, ${opacity})`
    return res
}
