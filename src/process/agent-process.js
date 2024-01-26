import { spawn } from 'child_process';

export class AgentProcess {
    constructor(name) {
        this.name = name;
    }
    start(profile='assist', init_message=null) {
        let args = ['src/process/init-agent.js', this.name];
        if (profile)
            args.push('-p', profile);
        if (init_message)
            args.push('-m', init_message);

        const agentProcess = spawn('node', args, {
            stdio: 'inherit',
            stderr: 'inherit',
        });
        
        let last_restart = Date.now();
        agentProcess.on('exit', (code, signal) => {
            console.log(`Agent process exited with code ${code} and signal ${signal}`);
            
            if (code !== 0) {
                // agent must run for at least 10 seconds before restarting
                if (Date.now() - last_restart < 10000) {
                    console.error('Agent process exited too quickly. Killing entire process. Goodbye.');
                    process.exit(1);
                }
                console.log('Restarting agent...');
                this.start('save', 'Agent process restarted. Notify the user and decide what to do.');
                last_restart = Date.now();
            }
        });
    
        agentProcess.on('error', (err) => {
            console.error('Failed to start agent process:', err);
        });
    }
}