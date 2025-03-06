import { Terminal } from "../entity/Terminal";
import { User } from "../entity/User";
export const logTerminalActivity = async (
  terminal: Terminal,
  user: User,
  action: string
) => {
  console.log(
    `[${new Date().toISOString()}] Terminal ${
      terminal.terminalNumber
    } - ${action} - User: ${user.first_name} ${user.last_name} (ID: ${
      user.user_id
    })`
  );
};
