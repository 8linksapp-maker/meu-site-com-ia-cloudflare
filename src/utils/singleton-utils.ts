/**
 * singleton-utils.ts
 * 
 * Utilitários para manipulação de singletons em formato YAML.
 * Agora estruturado para ser compatível com Edge Runtimes (Cloudflare Pages),
 * utilizando `import.meta.glob` em vez de `fs`.
 */

import yaml from 'js-yaml';

// Carrega todos os singletons globais no build
const allSingletons = import.meta.glob('/src/content/singletons/**/*.yaml', {
    eager: true,
    query: '?raw',
    import: 'default'
}) as Record<string, string>;

/**
 * Obtém o tema ativo
 */
async function getActiveThemeId(): Promise<string> {
    try {
        const settingsRaw = allSingletons['/src/content/singletons/settings.yaml'];
        if (settingsRaw) {
            const data = yaml.load(settingsRaw) as any;
            return data?.activeTheme || 'classic';
        }
    } catch (error) {
        // Ignorar erro e usar default
    }
    return 'classic';
}

/**
 * Lê um singleton específico do tema ativo
 */
export async function readSingleton(name: string, themeId?: string): Promise<any> {
    try {
        const activeTheme = themeId || await getActiveThemeId();

        let rawContent = allSingletons[`/src/content/singletons/${activeTheme}/${name}.yaml`];

        if (!rawContent) {
            // Se arquivo não existe, tentar ler do diretório antigo (retrocompatibilidade)
            rawContent = allSingletons[`/src/content/singletons/${name}.yaml`];
        }

        if (rawContent) {
            return yaml.load(rawContent);
        }

        return null;
    } catch (error) {
        console.error(`❌ Erro ao ler singleton ${name}:`, error);
        return null;
    }
}

/**
 * Escreve um singleton (cria ou atualiza) no tema ativo
 * AVISO: Em produção (Edge), não é possível escrever no filesystem.
 * Isso só funcionará com uma API/CMS adequado para a Cloudflare, como o Keystatic no modo GitHub.
 */
export async function writeSingleton(name: string, data: any, themeId?: string): Promise<boolean> {
    // Cloudflare Pages não suporta fs no runtime Edge. 
    // Para edição em produção o Keystatic já lida com o GitHub Actions/API.
    // O utils de write era usado localmente/dev-only ou em ambientes node puros.
    console.warn('writeSingleton: Gravação local de YAML desabilitada no Edge runtime. Use o painel Keystone/GitHub.');
    return false;
}

/**
 * Lista todos os singletons disponíveis para um tema
 */
export async function listSingletons(themeId?: string): Promise<string[]> {
    try {
        const activeTheme = themeId || await getActiveThemeId();
        const prefix = `/src/content/singletons/${activeTheme}/`;

        return Object.keys(allSingletons)
            .filter(key => key.startsWith(prefix) && key.endsWith('.yaml'))
            .map(key => key.replace(prefix, '').replace('.yaml', ''));
    } catch (error) {
        console.error('❌ Erro ao listar singletons:', error);
        return [];
    }
}
