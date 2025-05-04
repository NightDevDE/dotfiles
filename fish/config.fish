# Homebrew-Pfad setzen
set -gx PATH /opt/homebrew/bin $PATH

# Starship-Prompt aktivieren
starship init fish | source

# Editor setzen
set -Ux EDITOR gvim
set -Ux VISUAL gvim

# Kitty-Hosting-Befehl
function hostsetup
    kitty @ launch --type=tab fish -c 'cd /Volumes/Hosting/Domains; ls; exec fish'
    kitty @ launch --type=tab fish -c 'cd /opt/homebrew/etc/nginx/servers; ls; exec fish'
    kitty @ launch --type=tab nvim ~/.cloudflared/config.yml
end

# Schnell zu Projekten springen
alias dev='cd /Volumes/Hosting/Domains && ls -1'
alias nxservers='cd /opt/homebrew/etc/nginx/servers && ls'
alias cfconf='nvim ~/.cloudflared/config.yml'

# Cloudflare Tunnel starten und stoppen
alias start-tunnel "launchctl load ~/Library/LaunchAgents/com.user.cloudflared-mini-hosting.plist"
alias stop-tunnel "launchctl unload ~/Library/LaunchAgents/com.user.cloudflared-mini-hosting.plist"

# Neovide starten
function neo
    if test (count $argv) -eq 0
        neovide ~
    else
        if string match -qr '^~' $argv[1]
            set path (eval echo $argv[1])
        else
            set path $argv[1]
        end

        if test -e "$path"
            echo "📂 Öffne Neovide im Pfad: $path"
            neovide "$path"
        else
            echo "⚠️  Pfad '$path' existiert nicht!"
        end
    end
end
# Kitty neu starten

function kill-kitty
    set messages "👋 Bye bye Kitty..." "💥 Boom! New Kitty incoming!" "😿 RIP old Kitty..." "🚀 Launching fresh Kitty..." "🐾 Kitty respawning..."
    set random_index (random 1 (count $messages))
    echo $messages[$random_index]

    # 🧠 Starte Kitty NEU über macOS-Systemprozess
    osascript -e 'do shell script "open -na kitty"'

    # 💤 Optional: Warte minimal
    sleep 0.2

    # ❌ Schließe aktuelle Instanz (dieses Fenster)
    exit
end

function gvim
    if test (count $argv) -eq 0
        goneovim ~
    else
        goneovim $argv
    end
end

# Automatischer Tunnel-Status beim Terminalstart
function status-tunnel
    tunnel_status
end

status-tunnel
