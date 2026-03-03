#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N; if(!(cin>>N)) return 0;
    vector<int> p(N+1);
    for(int i=1;i<=N;i++) cin>>p[i];
    int idxMin=-1, idxMax=-1;
    for(int i=1;i<=N;i++){
        if(p[i]==1) idxMin=i;
        if(p[i]==N) idxMax=i;
    }
    if(idxMin==-1 || idxMax==-1){
        int mn=INT_MAX, mx=INT_MIN;
        for(int i=1;i<=N;i++){
            if(p[i] < mn){ mn = p[i]; idxMin = i; }
            if(p[i] > mx){ mx = p[i]; idxMax = i; }
        }
    }
    cout<<idxMin<<" "<<idxMax<<"\n";
    return 0;
}
