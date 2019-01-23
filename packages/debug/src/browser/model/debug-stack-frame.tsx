/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as React from 'react';
import { WidgetOpenerOptions, DISABLED_CLASS } from '@devpodio/core/lib/browser';
import { EditorWidget, Range, Position } from '@devpodio/editor/lib/browser';
import { DebugProtocol } from 'vscode-debugprotocol/lib/debugProtocol';
import { TreeElement } from '@devpodio/core/lib/browser/source-tree';
import { DebugScope } from '../console/debug-console-items';
import { DebugSource } from './debug-source';
import { RecursivePartial } from '@devpodio/core';
import { DebugSession } from '../debug-session';
import { DebugThread } from './debug-thread';

export class DebugStackFrameData {
    readonly raw: DebugProtocol.StackFrame;
}

export class DebugStackFrame extends DebugStackFrameData implements TreeElement {

    constructor(
        readonly thread: DebugThread,
        readonly session: DebugSession
    ) {
        super();
    }

    get id(): string {
        return this.session.id + ':' + this.thread.id + ':' + this.raw.id;
    }

    protected _source: DebugSource | undefined;
    get source(): DebugSource | undefined {
        return this._source;
    }
    update(data: Partial<DebugStackFrameData>): void {
        Object.assign(this, data);
        this._source = this.raw.source && this.session.getSource(this.raw.source);
    }

    async restart(): Promise<void> {
        await this.session.sendRequest('restartFrame', this.toArgs({
            threadId: this.thread.id
        }));
    }

    async open(options: WidgetOpenerOptions = {
        mode: 'reveal'
    }): Promise<EditorWidget | undefined> {
        if (!this.source) {
            return undefined;
        }
        const { line, column, endLine, endColumn } = this.raw;
        const selection: RecursivePartial<Range> = {
            start: Position.create(line - 1, column - 1)
        };
        if (typeof endLine === 'number') {
            selection.end = {
                line: endLine - 1,
                character: typeof endColumn === 'number' ? endColumn - 1 : undefined
            };
        }
        this.source.open({
            ...options,
            selection
        });
    }

    protected scopes: Promise<DebugScope[]> | undefined;
    getScopes(): Promise<DebugScope[]> {
        return this.scopes || (this.scopes = this.doGetScopes());
    }
    protected async doGetScopes(): Promise<DebugScope[]> {
        try {
            const response = await this.session.sendRequest('scopes', this.toArgs());
            return response.body.scopes.map(raw => new DebugScope(raw, this.session));
        } catch (e) {
            return [];
        }
    }

    protected toArgs<T extends object>(arg?: T): { frameId: number } & T {
        return Object.assign({}, arg, {
            frameId: this.raw.id
        });
    }

    render(): React.ReactNode {
        const classNames = ['theia-debug-stack-frame'];
        if (this.raw.presentationHint === 'label') {
            classNames.push('label');
        }
        if (this.raw.presentationHint === 'subtle') {
            classNames.push('subtle');
        }
        if (!this.source || this.source.raw.presentationHint === 'deemphasize') {
            classNames.push(DISABLED_CLASS);
        }
        return <div className={classNames.join(' ')}>
            <span className='expression' title={this.raw.name}>{this.raw.name}</span>
            {this.renderFile()}
        </div>;
    }
    protected renderFile(): React.ReactNode {
        const { source } = this;
        if (!source) {
            return undefined;
        }
        const origin = source.raw.origin && `\n${source.raw.origin}` || '';
        return <span className='file' title={source.longName + origin}>
            <span className='name'>{source.name}</span>
            <span className='line'>{this.raw.line}:{this.raw.column}</span>
        </span>;
    }

}
