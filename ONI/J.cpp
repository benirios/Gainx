#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int M,N;
    if(!(cin>>M>>N)) return 0;
    vector<int> a(M);
    for(int i=0;i<M;i++) cin>>a[i];
    sort(a.begin(), a.end());
    bool ok=true;
    for(int i=0;i<M;i++){
        if(a[i] < i+1){ ok=false; break; }
    }
    cout<<(ok?1:0)<<"\n";
    return 0;
}
