# 🚀 Deploy do Quiz Interativo na Digital Ocean

Este guia contém todas as instruções para fazer o deploy do Quiz Interativo na Digital Ocean.

## 📋 Pré-requisitos

- Conta na Digital Ocean com créditos
- Git instalado
- Node.js 18+ instalado

**Importante**: Se você quiser testar o build Docker localmente, precisará instalar o Docker Desktop. Veja instruções em `DOCKER_SETUP.md`.

## 🎯 Opções de Deploy

### Opção 1: Digital Ocean App Platform (Recomendado)

A forma mais simples e automática:

1. **Fork este repositório** no GitHub
2. **Configure o PartyKit:**
   ```bash
   npx partykit deploy --name quiz-interativo
   ```
3. **Na Digital Ocean:**
   - Vá em "App Platform"
   - Clique em "Create App"
   - Conecte seu repositório GitHub
   - Use a configuração em `.do/app.yaml`
   - Deploy automático! 🎉

**Custo estimado:** $5/mês

### Opção 2: Droplet com Docker

Para mais controle:

1. **Criar Droplet:**
   - Ubuntu 22.04 LTS
   - 1GB RAM ($6/mês)
   - Adicionar Docker do Marketplace

2. **No servidor:**
   ```bash
   # Conectar via SSH
   ssh root@seu-ip

   # Clonar projeto
   git clone https://github.com/VictorSmaniotto/quiz-interativo.git
   cd quiz-interativo

   # Deploy PartyKit
   npm install
   npx partykit deploy --name quiz-interativo

   # Rodar aplicação
   docker-compose up -d
   ```

3. **Configurar domínio (opcional):**
   ```bash
   # Instalar Nginx e Certbot
   apt install nginx certbot python3-certbot-nginx

   # Configurar SSL
   certbot --nginx -d seudominio.com
   ```

**Custo estimado:** $6/mês

### Opção 3: Container Registry

Para deploy profissional:

1. **Criar Container Registry na Digital Ocean**

2. **Autenticar:**
   ```bash
   # Instalar doctl
   snap install doctl

   # Configurar
   doctl auth init
   doctl registry login
   ```

3. **Build e Push:**
   ```bash
   # Usar o script de deploy
   chmod +x deploy.sh
   ./deploy.sh

   # Push manual
   docker push registry.digitalocean.com/seu-registry/quiz-interativo:latest
   ```

## 🔧 Configurações Importantes

### PartyKit
O PartyKit precisa ser deployado primeiro:
```bash
npx partykit deploy --name quiz-interativo
```

Anote a URL gerada (ex: `quiz-interativo.seuusuario.partykit.dev`)

### Variáveis de Ambiente
```bash
NODE_ENV=production
VITE_PARTYKIT_HOST=quiz-interativo.seuusuario.partykit.dev
```

### Domínio Personalizado
1. Configurar DNS na Digital Ocean
2. Apontar A record para o IP do droplet
3. Configurar SSL com Certbot

## 📊 Monitoramento

### Health Check
A aplicação possui endpoint de health check em `/health`

### Logs
```bash
# Ver logs do container
docker logs quiz-interativo-app

# Ver status
docker ps
```

### Recursos
```bash
# Uso de memória e CPU
docker stats

# Espaço em disco
df -h
```

## 🛠️ Troubleshooting

### Container não inicia
```bash
# Verificar logs
docker logs quiz-interativo-app

# Reconstruir
docker-compose down
docker-compose up --build -d
```

### PartyKit não conecta
1. Verifique se o deploy foi feito: `npx partykit list`
2. Confirme a URL nas variáveis de ambiente
3. Teste a conexão: `curl https://sua-url.partykit.dev`

### SSL/HTTPS
```bash
# Renovar certificado
certbot renew

# Verificar status
certbot certificates
```

## 💰 Custos Estimados

| Serviço | Custo/mês |
|---------|-----------|
| App Platform (Básico) | $5 |
| Droplet 1GB | $6 |
| Container Registry | $5 |
| Domínio | $1 |
| PartyKit | Gratuito* |

*Até 100k requisições/mês

## 📞 Suporte

Criado por [@VictorSmaniotto](https://linkedin.com/in/victorsmaniotto)

Para dúvidas ou suporte, entre em contato via LinkedIn.

## 🔄 Atualizações

### App Platform
Push para a branch `main` faz deploy automático.

### Droplet
```bash
cd quiz-interativo
git pull
docker-compose up --build -d
```

### Container Registry
```bash
./deploy.sh v1.1.0
# Depois atualizar no servidor
```

---

🎯 **Quiz Interativo** - Ferramenta moderna para engajamento de equipes
