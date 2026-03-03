Problema E - Viagem do Miguel

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/pintro/.
O Miguel prepara-se para mais uma viagem de avião. Visto que é alguém que viaja muito, o Miguel sabe exatamente os aviões que se encontram a voar neste preciso momento, assim como as suas coordenadas. Os aviões movem-se numa grelha bidimensional infinita e ocupam exatamente uma célula da grelha. Cada avião é identificado com uma coordenada X e uma coordenada Y e move-se pelo plano. Por exemplo, se houver um avião na posição (2, 3) e um na posição (1, 2) a grelha será algo como:

....
A...
.A..
....
Onde os . representam espaço vazio e os A aviões, sendo que a célula no canto inferior esquerdo representa a posição (1, 1). Adicionalmente, existem nuvens que ocupam também uma célula da grelha cada uma. Assim como os aviões, cada nuvem é identificada por uma coordenada X e uma coordenada Y, mas mantém-se sempre na mesma posição. Por exemplo, se além dos aviões do exemplo anterior tivermos uma nuvem na posição (2, 2) a grelha será algo como:

....
AN..
.A..
....
Onde o N representa a nuvem.

O Miguel quer estudar o movimento dos aviões, para tal ele sabe que inicialmente todos os aviões têm um sentido de movimento e movem-se à mesma velocidade de uma célula por unidade de tempo, sendo que o Miguel apenas está interessado nas primeira K unidades de tempo. Inicialmente, os aviões movem-se no sentido este (ou seja, no sentido positivo no eixo dos X). O movimento dos aviões é independente entre si (um avião não afeta o movimento de ninguém), mas as nuvens podem afetar o movimento dos aviões. Se por se mover para uma célula, um avião colidir com uma nuvem (ocupar a mesma posição), em vez de se mover o avião faz uma viragem à direita nessa unidade de tempo, ou seja, se se movia no sentido este passará a mover-se no sentido sul (sentido negativo dos Y), se se movia no sentido sul passará a mover-se no sentido oeste (sentido negativo dos X), se se movia no sentido oeste passará a mover-se no sentido norte (sentido positivo dos Y) e finalmente se se movia no sentido norte passará a mover-se no sentido este.

A título de exemplo, vamos ver o que acontece com o exemplo anterior após uma unidade de tempo:

....
AN..
..A.
....
O primeiro avião iria colidir com a nuvem, por isso virou à direita e movimentar-se-à agora para o sentido sul. O segundo a avião moveu-se uma unidade para a direita. Após mais uma unidade de tempo a grelha ficará da seguinte forma:

....
.N..
A..A
....
Como foi dito, o movimento dos aviões é independente, por isso pode acontecer que estejam dois aviões na mesma posição. O Miguel quer contar quantos pares distintos de aviões se encontram na mesma posição em algum momento do seu movimento durante as primeiras K unidades de tempo. Nota que pares distintos implica que se dois aviões se cruzarem várias vezes, só devem contar como um único par para a resposta. Consegues ajudar o Miguel?

O Problema

Dado o número de aviões N e as suas coordenadas, o número de nuvens M e as suas coordenadas e um número de unidades de tempo K, determinar o número de pares distintos de aviões que se cruzam.

Input

A primeira linha contém três inteiros N, M e K, o número de aviões, o número de nuvens e o números de unidades de tempo, respetivamente.

As N linhas seguinte têm cada uma 2 inteiros, as coordenadas X e Y por esta ordem, que definem a posição de cada avião.

As M linhas seguinte têm cada uma 2 inteiros, as coordenadas X e Y por esta ordem, que definem a posição de cada nuvem.

Output

Uma linha com o número pares de aviões que se cruzam.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N ≤ 100	     	Número de aviões
1 ≤ M ≤ 100	     	Número de nuvens
1 ≤ K ≤ 100	     	Unidades de tempo
1 ≤ Xi, Yi ≤ 100	     	Coordenadas iniciais
Input do Exemplo 1

2 1 4
2 3
1 2
2 2
Output do Exemplo 1

0
Explicação do Exemplo 1

Este exemplo corresponde ao do enunciado.

Input do Exemplo 2

5 10 15
4 3
4 2
3 3
3 2
3 4
4 4
5 2
1 1
5 4
5 3
3 5
1 3
2 1
2 2
4 5
Output do Exemplo 2

3
Input do Exemplo 3

4 8 10
2 2
2 3
3 2
3 3
1 2
1 3
3 1
2 1
4 2
4 3
3 4
2 4
Output do Exemplo 3

5



-----------------------------



Problema F - O jogo do Henrique

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/efi/.
O Henrique tem dois baralhos de cartas muito especiais. Ao contrário de um baralho de cartas normal, nenhuma carta tem um naipe e cada cada carta contém um número entre 1 e 1000. O Henrique gosta de jogar um jogo que consiste em fazer pares de cartas, uma do primeiro baralho e uma do segundo baralho. As regras do jogo não são importantes, mas para saber se o jogo é justo o Henrique precisa de saber quantos pares há cuja soma dos dois números é par e quantos há cuja soma é impar. Consegues ajudar o Henrique?

O Problema

Dada descrição dos dois baralho de cartas do Henrique, calcular o número de pares cuja soma é par e cuja soma é ímpar.

Input

Um inteiro N numa linha, o número de cartas no primeiro baralho. Na linha seguinte seguem-se N inteiros, que descrevem o primeiro baralho. A terceira linha contém um inteiro M e na próxima linha seguem-se M inteiros que constituem o segundo baralho.

Output

Dois inteiros numa linha separados por um espaço, sendo que o primeiro é o número de pares de cartas cuja soma é par e o segundo o número de pares de cartas cuja soma é ímpar, seguida de uma mudança de linha.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N, M ≤ 100 000	     	Números de cartas de cada baralho
1 ≤ Ni, Mi ≤ 1 000	     	Valor de cada carta
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	30	N, M ≤ 100
2	70	-
Input do Exemplo 1

4
1 2 3 4
3
1 2 3
Output do Exemplo 1

6 6
Input do Exemplo 2

4
5 5 2 3
4
1 1 1 4
Output do Exemplo 2

10 6




--------------------------




Problema G - A coleção do Pedro

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/algo/.
A coleção de cromos de jogadores e figuras do mítico clube de futebol Salgueiros é a mais importante e cobiçada da juventude hoje em dia. Há um total de N cromos para colecionar, sendo que cada cromo tem associado um número de 1 a N que é único a esse cromo. O Pedro tem uma coleção de M cromos, alguns possivelmente repetidos, e quer saber quantos cromos lhe falta para terminar a coleção, consegues ajudá-lo?

O Problema

Dado o número de cromos disponíveis e os cromos que o Pedro tem, calcular o número de cromos que lhe faltam.

Input

Dois inteiros N e M numa linha, o número de cromos no total e o número de cromos que o Pedro tem. De seguida vem uma linha com M inteiros de 1 a N, com os cromos que o Pedro tem, incluindo repetidos.

Output

Um inteiro, correspondente ao número de cromos dos N totais que o Pedro não tem.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N ≤ 100 000	     	Números de cromos disponíveis
1 ≤ M ≤ 100 000	     	Números de cromos colecionados pelo Pedro
1 ≤ Mi ≤ N	     	Valor de cada cromo colecionado
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	30	M ≤ 1000
2	70	-
Input do Exemplo 1

4 3
1 2 3
Output do Exemplo 1

1
Input do Exemplo 2

4 4
1 1 1 1
Output do Exemplo 2

3



--------------------



Problema H - O Guilherme vai às compras

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/algo/.
Para surpreender a sua família no Natal, o Guilherme decidiu comprar um conjunto de presentes. Depois de fazer uma pesquisa, encontrou N presentes que lhe interessam comprar e apontou o preço de cada um. O Guilherme quer comprar o máximo número de presentes possível, mas infelizmente tem um orçamento limitado. Para saber de quanto dinheiro precisa, o Guilherme tem M orçamentos diferentes e quer saber o máximo número de presentes que consegue comprar com cada um.

O Problema

Dado o número de presentes N que o Guilherme encontrou e os preços calcular para cada quantidade de dinheiro num orçamento o número máximo de presentes que o Guilherme consegue comprar.

Input

Dois inteiros N e M numa linha, o número de presentes e o número de orçamentos. De seguida vem uma linha com N inteiros, com os preços dos presentes, seguida uma linha com M inteiros, com os orçamentos.

Output

M linhas, cada uma contendo um inteiro, sendo que a i-ésima contém o número máximo de presentes para o i-ésimo orçamento dado no input.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N ≤ 100 000	     	Números de presentes
1 ≤ M ≤ 100 000	     	Números de orçamentos
1 ≤ Pi, Oi ≤ 10 000	     	Preço de cada presente e orçamento
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	40	M ≤ 1000
2	60	-
Input do Exemplo 1

6 6
8 5 3 5 6 1
5 10 27 1 2 9
Output do Exemplo 1

2
3
5
1
1
3
Input do Exemplo 2

10 5
1 3 2 4 8 1 6 6 2 4
1 5 10 15 20
Output do Exemplo 2

1
3
5
6
7




-------------------------




Problema I - As velas do Diogo

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/edados/.
A mesa da sala do Diogo está ornamentada com uma linha de N velas de diferentes alturas. Para decidir quais quer acender, o Diogo quer saber alguma informação sobre as velas, nomeadamente, para cada vela o Diogo quer saber qual a primeira vela que a precede cuja altura é menor que a da própria vela.

Suponhamos que N=6 e a altura das velas na linha é [4,1,3,3,7,3], então a primeira vela não tem velas mais baixas à sua esquerda, a segunda também não, já as terceira e quarta velas têm como vela mais baixa mais próxima à esquerda a segunda vela (de altura 1), a quinta vela é logo precedida pela quarta vela (de altura 3) e finalmente a última vela tem a segunda vela como mais próxima à esquerda e mais baixa (de altura 1).

O Problema

Dado o número de velas N de velas e a altura de cada, calcular a vela mais que está à esquerda mais próxima e mais baixa do que cada vela.

Input

Um inteiro N numa linha, o número de velas. De seguida vem uma linha com N inteiros com as alturas de cada velas.

Output

N inteiros numa linha separados por um espaço terminando com uma mudança de linha, sendo que o i-ésimo é a posição da vela que está à esquerda de i e é a mais próxima com altura menor que a de i. Caso todas as velas antes desta tenham altura maior ou igual imprima 0.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N ≤ 100 000	     	Números de velas
1 ≤ Ni ≤ 100 000	     	Altura de cada vela
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	40	N ≤ 1000
2	60	-
Input do Exemplo 1

6
4 1 3 3 7 3
Output do Exemplo 1

0 0 2 2 4 2
Input do Exemplo 2

4
1 4 2 1
Output do Exemplo 2

0 1 1 0



-------------------------




Problema I - As velas do Diogo

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/edados/.
A mesa da sala do Diogo está ornamentada com uma linha de N velas de diferentes alturas. Para decidir quais quer acender, o Diogo quer saber alguma informação sobre as velas, nomeadamente, para cada vela o Diogo quer saber qual a primeira vela que a precede cuja altura é menor que a da própria vela.

Suponhamos que N=6 e a altura das velas na linha é [4,1,3,3,7,3], então a primeira vela não tem velas mais baixas à sua esquerda, a segunda também não, já as terceira e quarta velas têm como vela mais baixa mais próxima à esquerda a segunda vela (de altura 1), a quinta vela é logo precedida pela quarta vela (de altura 3) e finalmente a última vela tem a segunda vela como mais próxima à esquerda e mais baixa (de altura 1).

O Problema

Dado o número de velas N de velas e a altura de cada, calcular a vela mais que está à esquerda mais próxima e mais baixa do que cada vela.

Input

Um inteiro N numa linha, o número de velas. De seguida vem uma linha com N inteiros com as alturas de cada velas.

Output

N inteiros numa linha separados por um espaço terminando com uma mudança de linha, sendo que o i-ésimo é a posição da vela que está à esquerda de i e é a mais próxima com altura menor que a de i. Caso todas as velas antes desta tenham altura maior ou igual imprima 0.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N ≤ 100 000	     	Números de velas
1 ≤ Ni ≤ 100 000	     	Altura de cada vela
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	40	N ≤ 1000
2	60	-
Input do Exemplo 1

6
4 1 3 3 7 3
Output do Exemplo 1

0 0 2 2 4 2
Input do Exemplo 2

4
1 4 2 1
Output do Exemplo 2

0 1 1 0


-------------------------



Problema J - As canecas do Francisco

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/palgo/.
O Francisco organizou a sua coleção de canecas pela sua estante. Ele tem exatamente N canecas e a sua estante tem N prateleiras, numeradas de 1 a N de baixo para cima. Para organizar tudo, o Francisco colocou exatamente uma caneca por prateleira.

No próximo Domingo vai haver uma grande festa e todos os seus M amigos vão comparecer. O Francisco quer que cada um dos seus amigos tenha direito a uma caneca, mas nem todos conseguem chegar a todas as prateleiras. O i-ésimo amigo tem uma altura Ai, ou seja, consegue chegar a todas as prateleiras desde a primeira até à Ai. Cada amigo vai à estante buscar exatamente uma caneca, das canecas a que consegue chegar (se alguém não conseguir chegar a uma determinada prateleira, não pode pedir ajuda a um colega mais alto). Consegues determinar se existe uma forma de atribuir canecas a cada um de forma a que cada um consiga chegar à sua caneca?

O Problema

Dado o número de amigos M e canecas N do Francisco e as respetivas alturas dos amigos do Francisco determinar se é possível que cada amigo fique com uma caneca a que consiga chegar.

Input

Dois inteiros M e N numa linha, o número de amigos e canecas. De seguida vem uma linha com M inteiros com as alturas dos amigos.

Output

Um inteiro 0 ou 1, 0 quando não há maneira de atribuir os amigos e 1 quando há.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ M ≤ N ≤ 100 000	     	Números de canecas e amigos
1 ≤ Ai ≤ 100 000	     	Altura de cada amigo
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	40	N, M ≤ 1000
2	60	-
Input do Exemplo 1

4 5
5 1 3 3
Output do Exemplo 1

1
Input do Exemplo 2

4 5
3 1 3 3
Output do Exemplo 2

0
Input do Exemplo 3

6 10
2 1 3 7 4 6
Output do Exemplo 3

1




-----------------------------





Problema K - As moedas do Rodrigo

Este é um problema de interação.
Ao contrário dos outros problemas em que deves fazer leitura de dados e escrita do output, neste problema deves interagir com o avaliador através da implementação de uma função e da interação com as funções fornecidas.
Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/interativos/.
O Rodrigo tem uma coleção de N moedas numeradas de 1 a N, cada uma com um peso diferente, que é infelizmente desconhecido. O Rodrigo que avaliar o valor da sua coleção, para isso precisa de saber qual é a sua moeda mais pesada e a mais leve. Para isso, vai usar uma balança muito precisa. Esta balança consegue determinar qual a moeda mais pesada dado um par de moedas (não é possível comparar grupos de moedas, apenas um par de moedas). Visto que a balança é muito delicada, ele quer minimizar o número de vezes que a usa, mas quer descobrir qual a moeda mais leve e a mais pesada na mesma, consegues descobri-lo no menor número de comparações?

O Problema

Dado o número de moedas N do Rodrigo, descobrir a mais pesada e a mais leve.

Ficheiros para Download

Podes começar por descarregar os ficheiros correspondentes à tua linguagem (ou um arquivo zip contendo tudo):

Nota: este problema foi criado quando ainda era permitida a linguagem Pascal e ainda não era permitida a linguagem Python. Iremos atualizar quando for possível, mas de momento, neste problema, o nosso servidor apenas irá permitir submissões em C, C++ ou Java.

Linguagem	Ficheiro a implementar	Ficheiro com avaliador exemplo	Ficheiros auxiliares	Input para avaliador exemplo
C	resolver.c	avaliador.c	avaliador.h	input.txt
C++	resolver.cpp	avaliador.cpp
Java	resolver.java	avaliador.java	------
Pascal	resolver.pas	avaliador.pas	avaliadorlib.pas
Nota que a implementação do avaliador a usar nos testes oficiais será diferente, mas podes esperar o mesmo comportamento. Além disso, é garantido que é possível efetuar 100.000 comparações em menos de 0.1 segundos.

Implementação

Deves submeter um único ficheiro que implementa a função resolver(N), que recebe um inteiro N, que representa o número de moedas do Rodrigo. Para isso deves usar o ficheiro resolver.{c,cpp,java,pas} que descarregaste, colocando no interior da função o teu código. Podes acrescentar outras funções, mas devem ficar todas neste ficheiro que é o único que deves submeter.

Função a implementar:
C/C++/Java:	void resolver(int N);
Pascal:	procedure resolver(N : Longint);

A tua função deve invocar as seguintes funções:

comparar(m1, m2) implementada pelo avaliador, que recebe dois inteiros que representam indíces de moedas e retorna 0 caso o peso da moeda de índice m1 for a mais leve ou 1 caso a moeda de índice m2 for a mais leve.

resposta(l, p) implementada pelo avaliador, que deves usar para indicar a tua resposta, o valor da variável l deve ser a moeda mais leve e p a mais pesada.

Nota que é importante que tanto m1 como m2 sejam entre 1 e N. Também é importante notar que se excederes 200.000 comparações o programa será interrompido e a resposta será considerada incorreta.

Funções do avaliador:
C/C++/Java:	int comparar(int m1, int m2);
Pascal:	function comparar(m1 : Longint, m2 : Longint): Longint;
C/C++/Java:	void resposta(int l, int p);
Pascal:	procedure resposta(l : Longint, p : Longint);

No caso do Java, as funções do avaliador estão incluídas na classe avaliador e por isso devem ser chamadas escrevendo avaliador.comparar(m1, m2) e avaliador.resposta(l, p).
A vossa função não deve ler nem escrever para os canais de entrada/saída padrão.

Exemplo

Vamos supor que N=4 e que a ordem relativa dos pesos das moedas é: 1 4 3 2, ou seja, a moeda 1 é a mais leve, a 4 a segunda mais leve, a 3 a terceira mais leve e a 2 a mais pesada. Claro que o nosso programa não terá acesso a esta informação, apenas ao valor de N e à função de comparação. O nosso programa poderia fazer o seguinte:

Invocação	Resultado	Descrição
comparar(1, 2)	0	Sabemos que a moeda 1 é mais leve que a 2
comparar(2, 3)	1	Sabemos que a moeda 3 é mais leve que a 2
comparar(3, 4)	1	Sabemos que a moeda 4 é mais leve que a 3
resposta(1, 2)		Respondemos que a moeda 1 é a mais leve e a 2 a mais pesada
Restrições

São garantidos os seguintes limites em todos os casos de teste:
1 ≤ N ≤ 100 000		Número de moedas.
Avaliação e Casos de Teste

Os casos de teste deste problema estarão agrupados em conjuntos de testes. Ao contrário dos restantes problemas, para obter pontuação é necessário acertar todos os casos de teste de um grupo de casos, nesse caso terão a pontuação completa relativa a esse grupo. Se falharem um ou mais casos de um grupo, a pontuação atribuída relativa a esse grupo será nula.

Cada grupo tem um número de pontos associado e um conjunto de restrições adicionais. Os grupos são os seguintes:

Grupo	Número de Pontos	Restrições adicionais
1	40	Máximo de 200 000 comparações
2	60	Máximo de 150 000 comparações
Testes no vosso computador

É disponibilizado um avaliador exemplo em cada linguagem (avaliador.{c,cpp,java,pas}) que pode ser utilizado para testar a vossa submissão. Para C/C++/Pascal está ainda disponível um ficheiro auxiliar (para C/C++ o avaliador.h e para Pascal o avaliadorlib.pas). Este avaliador não corresponde ao utilizado pelo sistema de avaliação.

Este avaliador começa por receber como input um inteiro N correspondendo ao número de moedas. Segue-se uma linha com N inteiros entre 1 e N, separados por espaços, que representam a ordem relativa dos pesos, que não devem conter valores repetidos.

O avaliador irá automaticamente invocar a função resolver(N) por vocês implementada e indicará se a resposta foi correta (devem invocar a função resposta(l, p) para isso). Em caso afirmativo, também indicará o número de comparações que foram efetuadas.

Disponibilizamos um ficheiro input.txt que contém um caso de teste exemplo.

Um exemplo de teste na tua máquina (supondo que tens os compiladores oficiais instalados) seria o seguinte:

Linguagem	Compilar	Executar com o exemplo
C	gcc -Wall avaliador.c resolver.c	./a.out < input.txt
C++	g++ -Wall avaliador.cpp resolver.cpp	./a.out < input.txt
Java	javac avaliador.java resolver.java	java avaliador < input.txt
Pascal	fpc avaliador.pas	./avaliador < input.txt




--------------------



Problema L - Restaurante do João

Este problema foi proposto no âmbito de um dos guias de introdução das ONI. No texto original podem encontrar mais informação sobre o problema assim como alguns conceitos que precisam de saber para o resolver. O artigo é o seguinte: http://oni.dcc.fc.up.pt/loop/guias/inicial/mat/.
O João é dono de um dos maiores restaurantes da zona. Todos vão ao seu restaurante e por isso há sempre muita procura por pratos novos. Para sistematizar a criação de pratos, o João agrupou os vários ingredientes que tem disponível em N grupos, onde cada ingrediente encontra-se em exatamente um grupo. O i-ésimo grupo tem exatamente gi ingredientes. Para criar um prato, o João pode escolher um ingrediente de cada grupo, mas não mais que 1.

Nota que não é preciso escolher ingredientes de todos os grupos, mas é preciso escolher pelo menos 1 ingrediente. O João quer saber o número de pratos diferentes que este sistema lhe permite criar. Como este número pode ser muito grande, o João quer saber o seu valor módulo 12345.

O Problema

Dado o número de ingredientes do João N e a quantidade gi que ele tem de cada ingrediente calcula o número de pratos diferentes qu ele pode fazer módulo 12345.

Input

Um inteiro N numa linha, o número de ingredientes. De seguida vem uma linha com N inteiros com a quantidade de cada ingrediente.

Output

Um inteiro entre 0 e 12344 que indica o número de pratos diferentes que o João pode fazer com os ingredientes que tem módulo 12345.

Restrições

São garantidos os seguintes limites em todos os casos de teste que irão ser colocados ao programa:

1 ≤ N ≤ 1 000 000	     	Números de ingredientes
1 ≤ Gi ≤ 12345	     	Quantidade de cada ingrediente
Os casos de teste deste problema estão organizados em 2 grupos com restrições adicionais diferentes:

Grupo	Número de Pontos	Restrições adicionais
1	40	N ≤ 1000
2	60	-
Input do Exemplo 1

4
10 8 21 5
Output do Exemplo 1

722
Input do Exemplo 2

5
100 200 300 400 500
Output do Exemplo 2

4265




