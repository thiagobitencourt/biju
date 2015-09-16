#### Config/SSL

> Neste diretório estão armazenados os arquivos SSL para o servidor HTTPS

Tutorial para gerar certificados:
	openssl genrsa -out biju-key.pem 1024
 	openssl req -new -key biju-key.pem -out biju-cert-req.csr
 	openssl x509 -req -in biju-cert-req.csr -signkey biju-key.pem -out biju-cert.pem