function neo
    if test (count $argv) -eq 0
        set path ~
    else
        # Sonderfall: Tilde (~) und relativer Pfad werden korrekt aufgelöst
        if string match -qr '^~' $argv[1]
            set path (eval echo $argv[1])
        else
            set path $argv[1]
        end
    end

    if test -e "$path"
        echo "📂 Öffne Neovide im Pfad: $path"
        open -a Neovide --args "$path"
    else
        echo "⚠️  Pfad '$path' existiert nicht!"
    end
end
