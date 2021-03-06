/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
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
import { Event } from '@devpodio/core/lib/common/event';
import { WidgetOpenerOptions } from '@devpodio/core/lib/browser';
import { TerminalWidgetOptions, TerminalWidget } from './terminal-widget';

/**
 * Service manipulating terminal widgets.
 */
export const TerminalService = Symbol('TerminalService');
export interface TerminalService {

    /**
     * Create new terminal with predefined options.
     * @param options - terminal options.
     */
    newTerminal(options: TerminalWidgetOptions): Promise<TerminalWidget>;

    /**
     * Display new terminal widget.
     * @param terminal - widget to attach.
     * @deprecated use #open
     */
    activateTerminal(terminal: TerminalWidget): void;

    open(terminal: TerminalWidget, options?: WidgetOpenerOptions): void;

    readonly all: TerminalWidget[];

    getById(id: string): TerminalWidget | undefined;

    readonly onDidCreateTerminal: Event<TerminalWidget>;

    readonly currentTerminal: TerminalWidget | undefined;

    readonly onDidChangeCurrentTerminal: Event<TerminalWidget | undefined>;
}
