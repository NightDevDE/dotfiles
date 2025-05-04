function hostsetup
    kitty @ launch --type=tab --cwd=/Volumes/Hosting/Domains && ls
    kitty @ launch --type=tab --cwd=/opt/homebrew/etc/nginx/servers && ls
    kitty @ launch --type=tab nvim ~/.cloudflared/config.yml
end
