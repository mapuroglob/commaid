import { execSync }         from 'child_process';
import { existsSync }       from 'fs';
import path                 from 'path';

import { COMMON_COMMANDS,
    constants }             from '../src/constants';
import { Commands,
    IProject,
    ProcessingOptions,
    ProjectDefinition, 
    ProjectFunctionType }   from '../types/index';
import logger               from './helpers/logger';

/**
 * @typedef { import("./types").IProject } IProject
 */
export class Project implements IProject<ProjectFunctionType> {
    name: string;
    originUrl: string;
    cwd: string;
    user: string;
    branches: {
        main: string;
    };
    commands: Commands<string> = COMMON_COMMANDS;

    constructor(pd: ProjectDefinition, { cwd, user }: { cwd: string, user: string }){
        this.name = pd.name;
        this.originUrl = pd.originUrl;
        this.branches = pd.branches;
        // Set default properties
        this.cwd = pd.cwd ? pd.cwd : cwd;
        this.user = pd.user ? pd.user : user;
        if (Object.keys(pd.commands || {}).length !== 0) this.commands = { ...COMMON_COMMANDS, ...pd.commands};
    }

    announceCommand = (command: string) => {
        console.log('');
        logger.info(`Project: ${this.name}`);
        console.log('');
        console.log(`> ${command}\n`);
    }

    clone = () => {
        const command = this.commands.clone.replace(/<url>/gi, this.originUrl).replace(/<user>/gi, this.user);
        this.announceCommand(command);
        if (!existsSync(this.cwd)) throw new Error(`Working directory \`${this.cwd}\` not found.`) 
        execSync(command, { cwd: this.cwd, stdio: 'inherit' });
    }

    install = () => {
        const command = this.commands.install;
        this.announceCommand(command);
        execSync(command, { cwd: path.join(this.cwd, this.name), stdio: 'inherit' });
    }

    update({ branch }: ProcessingOptions) {
        if (!this.branches[branch]) throw new Error(`Branch \`${branch}\` not found in \`${this.name}\` definition. Add this branch into ${constants.CONFIG_FILE_PATH}.`) 
        const command = this.commands.update.replace(/<branch>/gi, this.branches[branch]);
        this.announceCommand(command);
        execSync(command, { cwd: path.join(this.cwd, this.name), stdio: 'inherit' });
    }

    exec({ command }: ProcessingOptions) {
        const commandToExec = command.join(' ');
        this.announceCommand(commandToExec);
        execSync(commandToExec, { cwd: path.join(this.cwd, this.name), stdio: 'inherit' });
    }
}
