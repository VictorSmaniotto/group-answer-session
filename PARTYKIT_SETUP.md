# 🎈 Configuração do PartyKit no Servidor

## Problema: Login do PartyKit no Servidor

O PartyKit está tentando abrir um navegador no servidor (que não tem interface gráfica).

## Solução 1: Login Manual

### 1. Fazer login localmente (no seu computador)

```bash
# No seu computador local
npx partykit login
```

### 2. Copiar token para o servidor

```bash
# No seu computador, encontrar o token
# Windows:
type %USERPROFILE%\.partykit\auth.json

# Linux/Mac:
cat ~/.partykit/auth.json
```

### 3. Criar arquivo de auth no servidor

```bash
# No servidor, criar diretório
mkdir -p ~/.partykit

# Criar arquivo com o token
nano ~/.partykit/auth.json

# Colar o conteúdo do arquivo local
```

## Solução 2: Login via Token (Recomendado)

### 1. Obter token do PartyKit

1. Vá para: https://dashboard.partykit.io/
2. Faça login
3. Vá em "Settings" → "API Keys"
4. Crie um novo token

### 2. Configurar no servidor

```bash
# Exportar token como variável de ambiente
export PARTYKIT_TOKEN="seu-token-aqui"

# Ou adicionar ao profile
echo 'export PARTYKIT_TOKEN="seu-token-aqui"' >> ~/.bashrc
source ~/.bashrc
```

### 3. Testar

```bash
# Testar se funcionou
npx partykit whoami
npx partykit list
```

## Solução 3: Deploy Direto

Se ainda não funcionar, tente deploy direto:

```bash
# Deploy sem verificar lista
npx partykit deploy --name quiz-interativo

# Se pedir login, use a URL fornecida no seu navegador local
```

## Solução 4: Usar Variáveis de Ambiente

### 1. Editar arquivo .env.production

```bash
# Editar arquivo de produção
nano .env.production

# Usar uma URL temporária para teste
NODE_ENV=production
VITE_PARTYKIT_HOST=partykit.io
VITE_PARTYKIT_PROTOCOL=https
```

### 2. Reconstruir aplicação

```bash
# Parar containers
docker-compose down

# Reconstruir
docker-compose up --build -d
```

## Solução 5: Alternativa - Use o PartyKit já deployado

Se você já tem um PartyKit deployado (do desenvolvimento local), pode usar ele:

### 1. Verificar no seu computador local

```bash
# No seu computador
npx partykit list
```

### 2. Usar a URL no servidor

```bash
# Editar .env.production no servidor
nano .env.production

# Usar a URL do PartyKit que já existe
NODE_ENV=production
VITE_PARTYKIT_HOST=quiz-interativo.seuusuario.partykit.dev
VITE_PARTYKIT_PROTOCOL=https
```

### 3. Reconstruir

```bash
docker-compose down
docker-compose up --build -d
```

## Próximos Passos

1. **Tente a Solução 2** (token de API) - é a mais confiável
2. **Se não funcionar, use a Solução 5** (PartyKit existente)
3. **Se ainda não funcionar, me diga qual erro aparece**

## Comandos de Teste

```bash
# Testar se o PartyKit está funcionando
curl https://quiz-interativo.seuusuario.partykit.dev

# Testar aplicação
curl http://localhost

# Ver logs
docker logs quiz-interativo-app
```

**Qual solução você quer tentar primeiro?**
