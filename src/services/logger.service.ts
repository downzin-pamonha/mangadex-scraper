import colors from 'colors';

type LogType = 'existente' | 'inserido' | 'erro' | 'sucesso' | 'sistema' | 'aviso';

interface ColorFunctions {
    [key: string]: (text: string) => string;
}

const colorFunctions: ColorFunctions = {
    yellow: colors.yellow,
    green: colors.green,
    red: colors.red,
    blue: colors.blue,
    gray: colors.gray,
};

const logTypes: Record<LogType, { badge: string; color: keyof typeof colorFunctions }> = {
    existente: { badge: 'ﾠ🔌 Existenteﾠ', color: 'yellow' },
    inserido: { badge: 'ﾠ✅ Inseridoﾠﾠ', color: 'green' },
    erro: { badge: 'ﾠ💢 Erroﾠ', color: 'red' },
    sucesso: { badge: 'ﾠ✅ Sucessoﾠﾠﾠ', color: 'green' },
    sistema: { badge: 'ﾠ💻 Sistemaﾠﾠﾠ', color: 'blue' },
    aviso: { badge: 'ﾠ⚠️ Avisoﾠ', color: 'yellow' },
};

export function logger(message: string, type: LogType = 'existente') {
    const { badge, color } = logTypes[type];
    const colorFn = colorFunctions[color];
    const currentTime = `[${new Date().toLocaleTimeString()}] `;

    console.log(colorFn(currentTime + colors.bold(badge) + ' ' + message));
}
