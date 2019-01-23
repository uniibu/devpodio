/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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

import { inject, injectable, named } from 'inversify';
import URI from '@devpodio/core/lib/common/uri';
import { ContributionProvider, MaybePromise, Prioritizeable } from '@devpodio/core';

export const PreviewHandler = Symbol('PreviewHandler');

export interface RenderContentParams {
    content: string;
    originUri: URI;
}

export namespace RenderContentParams {
    export function is(params: object | undefined): params is RenderContentParams {
        return !!params && 'content' in params && 'originUri' in params;
    }
}

export interface PreviewHandler {
    readonly iconClass?: string;
    canHandle(uri: URI): number;
    renderContent(params: RenderContentParams): MaybePromise<HTMLElement | undefined>;
    findElementForFragment?(content: HTMLElement, fragment: string): HTMLElement | undefined;
    findElementForSourceLine?(content: HTMLElement, sourceLine: number): HTMLElement | undefined;
    getSourceLineForOffset?(content: HTMLElement, offset: number): number | undefined;
}

@injectable()
export class PreviewHandlerProvider {

    constructor(
        @inject(ContributionProvider) @named(PreviewHandler)
        protected readonly previewHandlerContributions: ContributionProvider<PreviewHandler>
    ) { }

    findContribution(uri: URI): PreviewHandler[] {
        const prioritized = Prioritizeable.prioritizeAllSync(this.previewHandlerContributions.getContributions(), contrib =>
            contrib.canHandle(uri)
        );
        return prioritized.map(c => c.value);
    }

    canHandle(uri: URI): boolean {
        return this.findContribution(uri).length > 0;
    }

}
