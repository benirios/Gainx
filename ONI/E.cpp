#include <iostream>
#include <vector>
#include <unordered_set>
#include <unordered_map>
#include <cstdint>
#include <algorithm>
#include <utility>
#include <cstdio>
#include <cstdlib>
#include <cstring>

using namespace std;
using ll = long long;
static inline ll posKey(int x, int y){ return ( (ll)(unsigned int)x << 32 ) | (unsigned int)y; }
static inline ll pairKey(int a, int b){ if(a>b) swap(a,b); return ( (ll)(unsigned int)a << 32 ) | (unsigned int)b; }
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N,M,K;
    if(!(cin>>N>>M>>K)) return 0;
    vector<int> x(N), y(N), dir(N,0);
    for(int i=0;i<N;i++) cin>>x[i]>>y[i];
    unordered_set<ll> clouds;
    clouds.reserve((size_t)max(1,M)*2+10);
    for(int i=0;i<M;i++){ int cx,cy; cin>>cx>>cy; clouds.insert(posKey(cx,cy)); }

    unordered_set<ll> seenPairs;
    seenPairs.reserve((size_t)N*N/2 + 10);

    unordered_map<ll, vector<int>> posMap;
    posMap.reserve((size_t)N*2+10);


    int dx[4]={1,0,-1,0};
    int dy[4]={0,-1,0,1};
    for(int t=0;t<K;t++){
        vector<int> nx(N), ny(N);
        for(int i=0;i<N;i++){
            int tx = x[i] + dx[dir[i]];
            int ty = y[i] + dy[dir[i]];
            if(clouds.find(posKey(tx,ty))!=clouds.end()){
                dir[i] = (dir[i]+1)%4;
                nx[i]=x[i]; ny[i]=y[i];
            } else {
                nx[i]=tx; ny[i]=ty;
            }
        }
        // detect swaps (continuous-time crossings): i moves to j's old pos and j moves to i's old pos
        for(int i=0;i<N;i++){
            for(int j=i+1;j<N;j++){
                if(nx[i]==x[j] && ny[i]==y[j] && nx[j]==x[i] && ny[j]==y[i]){
                    seenPairs.insert(pairKey(i,j));
                }
            }
        }
        x.swap(nx); y.swap(ny);
        posMap.clear();
        for(int i=0;i<N;i++) posMap[posKey(x[i], y[i])].push_back(i);
        for(auto &kv : posMap){ auto &v = kv.second; int s=v.size(); for(int i=0;i<s;i++) for(int j=i+1;j<s;j++) seenPairs.insert(pairKey(v[i], v[j])); }
    }
    cout << seenPairs.size() << '\n';
    return 0;
}
