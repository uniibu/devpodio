/********************************************************************************
 * Copyright (C) 2018 Ericsson and others.
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

import { injectable, inject } from 'inversify';
import { CommandRegistry, MenuModelRegistry } from '@devpodio/core/lib/common';
import { CommonMenus, AbstractViewContribution, FrontendApplicationContribution, FrontendApplication } from '@devpodio/core/lib/browser';
import { GettingStartedWidget } from './getting-started-widget';
import { FrontendApplicationStateService } from '@devpodio/core/lib/browser/frontend-application-state';
import { WorkspaceService } from '@devpodio/workspace/lib/browser';

export const GettingStartedCommand = {
    id: GettingStartedWidget.ID,
    label: GettingStartedWidget.LABEL
};

@injectable()
export class GettingStartedContribution extends AbstractViewContribution<GettingStartedWidget> implements FrontendApplicationContribution {

    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;

    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    constructor() {
        super({
            widgetId: GettingStartedWidget.ID,
            widgetName: GettingStartedWidget.LABEL,
            defaultWidgetOptions: {
                area: 'main',
            }
        });
    }

    async onStart(app: FrontendApplication): Promise<void> {
        if (!this.workspaceService.opened) {
            this.stateService.reachedState('ready').then(
                a => this.openView({ reveal: true })
            );
        }
    }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(GettingStartedCommand, {
            execute: () => this.openView({ reveal: true }),
        });
    }

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.HELP, {
            commandId: GettingStartedCommand.id,
            label: GettingStartedCommand.label,
            order: 'a10'
        });
    }
}
