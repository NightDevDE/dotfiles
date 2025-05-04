function tunnel_status
    set GREEN (set_color green)
    set RED (set_color red)
    set CYAN (set_color cyan)
    set NC (set_color normal)

    set TUNNEL_NAME "mini-hosting"
    set URLS "https://fotobrush.com" "https://badmax.net" "cyberbox.dev" "cam2cam-show.com"

    set ALERT false

    if pgrep -f "cloudflared.*$TUNNEL_NAME" > /dev/null
        set TUNNEL_STATUS "$GREEN"'[RUNNING]'"$NC"
    else
        set TUNNEL_STATUS "$RED"'[DOWN]'"$NC"
        set ALERT true
    end

    if pgrep nginx > /dev/null
        set NGINX_STATUS "$GREEN"'[RUNNING]'"$NC"
    else
        set NGINX_STATUS "$RED"'[STOPPED]'"$NC"
        set ALERT true
    end

    echo ""
    echo "────────────────────────────────────────────"
    echo "🌐 Cloudflare Tunnel: $TUNNEL_STATUS"
    echo "🖥️  NGINX Status:      $NGINX_STATUS"
    echo "────────────────────────────────────────────"
    echo "📄 Webseiten-Status:"

    for URL in $URLS
        set HTTP_STATUS (curl -s -o /dev/null -w "%{http_code}" --max-time 5 $URL)

        if test "$HTTP_STATUS" = "200"
            set SITE_STATUS "$GREEN"'[LIVE]'"$NC"
        else
            set SITE_STATUS "$RED"'[DOWN]'"$NC"
            set ALERT true
        end

        printf "  %-45s %s\n" "$URL" "$SITE_STATUS"
    end

    echo "────────────────────────────────────────────"
    echo ""

    if test "$ALERT" = "true"
        afplay /System/Library/Sounds/Basso.aiff &
    end
end
