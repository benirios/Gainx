#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N,M; if(!(cin>>N>>M)) return 0;
    vector<char> have(N+1,0);
    for(int i=0;i<M;i++){ int v; cin>>v; if(v>=1 && v<=N) have[v]=1; }
    int missing=0;
    for(int i=1;i<=N;i++) if(!have[i]) missing++;
    cout<<missing<<"\n";
    return 0;
}
