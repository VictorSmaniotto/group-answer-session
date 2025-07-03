#!/bin/bash

# Script de configuração do servidor Digital Ocean
# Para ser executado no droplet após criação

echo "🔧 Configurando servidor para Quiz Interativo..."
echo "==============================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Atualizar sistema
echo -e "${YELLOW}📦 Atualizando sistema...${NC}"
apt update && apt upgrade -y

# Instalar dependências
echo -e "${YELLOW}🛠️ Instalando dependências...${NC}"
apt install -y \
    curl \
    git \
    nginx \
    certbot \
    python3-certbot-nginx \
    ufw \
    htop \
    unzip

# Instalar Docker se não estiver instalado
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Instalando Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker $USER
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Instalar Node.js 18
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Configurar firewall
echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow http
ufw allow https

# Criar diretório para a aplicação
echo -e "${YELLOW}📁 Criando estrutura de diretórios...${NC}"
mkdir -p /opt/quiz-interativo
cd /opt/quiz-interativo

# Configurar Nginx básico
echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"
cat > /etc/nginx/sites-available/quiz-interativo << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/quiz-interativo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Criar script de deploy
cat > /opt/quiz-interativo/update.sh << 'EOF'
#!/bin/bash
echo "🔄 Atualizando Quiz Interativo..."

cd /opt/quiz-interativo

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose up --build -d

echo "✅ Atualização concluída!"
EOF

chmod +x /opt/quiz-interativo/update.sh

# Criar script de backup
cat > /opt/quiz-interativo/backup.sh << 'EOF'
#!/bin/bash
echo "💾 Fazendo backup..."

BACKUP_DIR="/opt/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/quiz-interativo_$DATE.tar.gz /opt/quiz-interativo

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "quiz-interativo_*.tar.gz" -mtime +7 -delete

echo "✅ Backup salvo em $BACKUP_DIR/quiz-interativo_$DATE.tar.gz"
EOF

chmod +x /opt/quiz-interativo/backup.sh

# Configurar cron para backup diário
echo "0 2 * * * /opt/quiz-interativo/backup.sh" | crontab -

# Mostrar informações do sistema
echo ""
echo -e "${GREEN}✅ Servidor configurado com sucesso!${NC}"
echo -e "${BLUE}📋 Informações do sistema:${NC}"
echo "   - Docker: $(docker --version)"
echo "   - Docker Compose: $(docker-compose --version)"
echo "   - Node.js: $(node --version)"
echo "   - Nginx: $(nginx -v 2>&1)"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "1. Clone o repositório:"
echo "   git clone https://github.com/VictorSmaniotto/quiz-interativo.git ."
echo ""
echo "2. Configure as variáveis de ambiente"
echo ""
echo "3. Inicie a aplicação:"
echo "   docker-compose up -d"
echo ""
echo "4. Para domínio personalizado:"
echo "   certbot --nginx -d seudominio.com"
echo ""
echo -e "${GREEN}🎯 Servidor pronto para o Quiz Interativo!${NC}"
echo -e "${BLUE}👨‍💻 Configurado por @VictorSmaniotto${NC}"
