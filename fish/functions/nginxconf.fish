function nginxconf --wraps='code /opt/homebrew/etc/nginx/servers/' --description 'alias nginxconf=code /opt/homebrew/etc/nginx/servers/'
  code /opt/homebrew/etc/nginx/servers/ $argv
        
end
