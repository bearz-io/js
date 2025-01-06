#!/usr/bin/env bash

export DEBIAN_FRONTEND=noninteractive

if [ -z "$USER" ]; then
    echo "USER is not set"
    exit 1
fi

if [ ! -f "/etc/sudoers.d/$USER" ]; then 
    if [ -z "$USER_PASSWORD" ]; then
        if [ -f ~/.password ]; then
            USER_PASSWORD="$(cat ~/.password)"
        else
            echo "USER_PASSWORD is not set"
            exit 1
        fi
    fi

    # This is a hack to avoid the password prompt
    sudo -S <<< "$USER_PASSWORD" echo "" > /dev/null

    # This is the actual command
    echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee "/etc/sudoers.d/$USER"
    sudo chmod 440 "/etc/sudoers.d/$USER"
fi

if [ ! -d "/home/$USER/.local/bin" ]; then
    mkdir -p "/home/$USER/.local/bin"

    echo "" | tee -a "/home/$USER/.bashrc"
    echo "## Local Bin" | tee -a  "/home/$USER/.bashrc"
    echo "export PATH=\"/home/$USER/.local/bin:\$PATH\"" | tee -a  "/home/$USER/.bashrc"
fi

packages=(
    "curl"
    "git"
    "wget"
    "unzip"
    "software-properties-common"
    "jq"
    "net-tools"
    "nfs-common"
    "cifs-utils"
    "tre-command"
    "wget"
    "btop"
    "ubi"
    "age"
    "deno"
    "sops"
    "bat"
    "zoxide"
    "lazygit"
    "rclone"
    "yq"
    "eza"
    "ripgrep"
    "oh-my-posh"
    "docker"
    "lazydocker"
)

for package in "${packages[@]}"; do
    echo ""
    echo "[$package]"
    echo "Installing $package"

    case $package in
        "deno")
            if ! command -v deno &> /dev/null; then
                
                
                export DENO_INSTALL="/home/$USER/.local"
                if [ ! -f "$DENO_INSTALL/bin/deno" ]; then
                    mkdir -p "$DENO_INSTALL"
                fi
                
                export PATH="$DENO_INSTALL/bin:$PATH"
                echo "" | tee -a "/home/$USER/.bashrc"
                echo "## Deno" | tee -a "/home/$USER/.bashrc"
                echo "export DENO_INSTALL=\"/home/$USER/.local\"" | tee -a  "/home/$USER/.bashrc"



                curl -fsSL https://deno.land/x/install/install.sh | DENO_INSTALL="/home/$USER/.local" sh
            fi
            ;;

        "rclone")
            if ! command -v rclone &> /dev/null; then
                curl https://rclone.org/install.sh | sudo bash
            fi
            ;;
        
        "ubi")
            if ! command -v ubi &> /dev/null; then
                url="https://raw.githubusercontent.com/houseabsolute/ubi/master/bootstrap/bootstrap-ubi.sh"
                curl --silent --location "$url" | sudo sh 
            fi
            ;;

        "sops")
            if ! command -v sops &> /dev/null; then
                sudo ubi -p getsops/sops --in "/usr/local/bin" -t "v3.9.3"
            fi
            ;;

        "docker")
            if ! command -v docker &> /dev/null; then
                curl -fsSL https://get.docker.com | sh
                sudo usermod -aG docker "$USER"
            fi
            ;;

        "lazydocker")
            if ! command -v lazydocker &> /dev/null; then
                curl https://raw.githubusercontent.com/jesseduffield/lazydocker/master/scripts/install_update_linux.sh | bash
            fi
            ;;

        "lazygit")
            if ! command -v lazygit &> /dev/null; then
                LAZYGIT_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazygit/releases/latest" | \grep -Po '"tag_name": *"v\K[^"]*')
                curl -Lo lazygit.tar.gz "https://github.com/jesseduffield/lazygit/releases/download/v${LAZYGIT_VERSION}/lazygit_${LAZYGIT_VERSION}_Linux_x86_64.tar.gz"
                tar xf lazygit.tar.gz lazygit
                sudo install lazygit -D -t /usr/local/bin/
                rm lazygit.tar.gz lazygit
            fi
            ;;

        "oh-my-posh")
            if ! command -v oh-my-posh &> /dev/null; then
                curl -s https://ohmyposh.dev/install.sh | bash -s
                curl -fsSL "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/refs/heads/main/themes/microverse-power.omp.json" -o "/home/$USER/.config/omp/default.omp.json"

                echo "" | tee -a "/home/$USER/.bashrc"
                echo "## Oh My Posh" | tee -a "/home/$USER/.bashrc"
                echo "eval \$(oh-my-posh --init --shell bash --config /home/$USER/.config/omp/default.omp.json)" | tee -a "/home/$USER/.bashrc"
            fi
            ;;
        *)
            if ! command -v "$package" &> /dev/null; then
                sudo apt-get install -y "$package"
            fi
            ;;
    esac
done

if  command -v zoxide &> /dev/null; then

    if grep -q "## Zoxide" "/home/$USER/.bashrc"; then
        echo "Zoxide is already installed"
    else 
        echo "" | tee -a "/home/$USER/.bashrc"
        echo "## Zoxide" | tee -a "/home/$USER/.bashrc"
        echo "eval \"\$(zoxide init bash)\"" | tee -a "/home/$USER/.bashrc"
    fi
fi

exit 0