#include <bits/stdc++.h>
using namespace std;
int main(){
    int N;
    if(scanf("%d", &N)!=1) return 0;
    const int MOD = 12345;
    int res = 1;
    for(int i=0;i<N;i++){
        int g; scanf("%d", &g);
        res = (int)((1LL * res * ((g + 1) % MOD)) % MOD);
    }
    res = (res - 1 + MOD) % MOD;
    printf("%d\n", res);
    return 0;
}
