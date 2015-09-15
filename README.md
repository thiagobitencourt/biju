Projeto Biju
===================


Projeto de software para administração de rede de distribuição/revenda de acessórios femininos. O projeto conta com funcionalidades como, cadastrar pessoas, peças/produtos e kits com as peças cadastradas. Inclui também a possibilidade de administração de rendimentos, através de relatórios de vendas mensais e/ou personalizados.

----------

Equipe
-------------

**Fron-end:** 
> Mohamad Abu Ali <arabian@brasnet.org.br>

**Back-end:** 
> Gustavo R. Valiati <gustavovaliati@gmail.com>
> Thiago R. M. Bitencourt <thiago.mbitencourt@gmail.com> 


Estrutura de diretórios
-------------------

#### <i class="icon-folder-open"></i> Server

> Diretório com conteúdo e códigos relacionados ao Back-end da aplicação.
> Dividido em sub-diretórios.

##### <i class="icon-folder-open"></i> Models
Todos os modelos de entidades são implementadas dentro deste diretório.

##### <i class="icon-folder-open"></i> Dao
Todos as classes relacionadas a manipulação de entidades são implementadas dentro deste diretório.

##### <i class="icon-folder-open"></i> Controller
Todos as classes relacionadas a lógicas de negócio e ligação entre banco de dados e serviços são implementadas dentro deste diretório.

##### <i class="icon-folder-open"></i> Utils
Classes com códigos utilitários a serem utilizados dentro do projeto são implementadas dentro deste diretório.

#### <i class="icon-folder-open"></i> Web
> Todo código relacionado ao fron-end da aplicação estão presente neste diretório. Possui sub-diretórios para melhor organizar o código.

##### <i class="icon-folder-open"></i> Lib
Todos os aquivos referentes a bibliotecas e/ou códigos externos serão armazenados dentro deste diretório, podendo haver sub-diretórios.

##### <i class="icon-folder-open"></i> JS
Códigos de implementação relacionados ao Front-end, escritos em JavaScript, estão dentro deste diretório. Este diretório possui sub-diretórios.

##### <i class="icon-folder-open"></i> CSS
Códigos de implementação relacionados ao Front-end, escritos em CSS, estão dentro deste diretório.

##### <i class="icon-folder-open"></i> Images
Diretório utilizado para armazenar imagens utilizadas na aplicação.

##### <i class="icon-folder-open"></i> View
Diretório utilizado para armazenar as telas (GUI) apresentadas pela aplicação.

#### <i class="icon-folder-open"></i> Config

> Neste diretório estão armazenados códigos e scripts de configuração, podendo haver sub-diretórios.

#### <i class="icon-file"></i> app.js
Ponto de início da aplicação.


> **OBS:** A estrutura de diretórios pode ser alterada ao longo do desenvolvimento, portanto, a estrutura atualizada é sempre a estrutura encontrada no diretório raíz do repositório.

Estrutura do Respositório
-------------------

#### <i class="icon-pencil"></i> Master

Deve estar sempre com código apto a ser deployado, ou seja, código com funcionalidades completas testadas e sem erros que, ao ser implantado em produção, irão rodas sem nenhum tipo de problema.

#### <i class="icon-pencil"></i> Novas funcionalidades

Sempre em desenvolvimento em um branch separado, com um nome significativo. Só deve ser acrescentado ao branch master após estar totalmente implementado e testado em todos os casos de uso.
Após o encerramento da implementação da funcionalidade o branch não deve ser removido, para fins de histórico.

#### <i class="icon-pencil"></i> Correção de Erros  e Bugs

Erros e Bugs sempre deve ser corrigidos em um novo branch, com um nome significativo, e apenas incorporado ao branch master após testado em todos os casos de uso e identificado que o problema foi corrigido. Após o encerramento da correção não é necessário excluir o branch, para fins de histórico.