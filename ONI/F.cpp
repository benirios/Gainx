#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long N; if(!(cin>>N)) return 0;
    long long even1=0, odd1=0;
    for(int i=0;i<N;i++){ long long v; cin>>v; if(v%2==0) even1++; else odd1++; }
    long long M; cin>>M;
    long long even2=0, odd2=0;
    for(int i=0;i<M;i++){ long long v; cin>>v; if(v%2==0) even2++; else odd2++; }
    long long evenPairs = even1*even2 + odd1*odd2;
    long long oddPairs = even1*odd2 + odd1*even2;
    cout<<evenPairs<<" "<<oddPairs<<"\n";
    return 0;
}
