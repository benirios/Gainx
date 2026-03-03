#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N,M;
    if(!(cin>>N>>M)) return 0;
    vector<long long> prices(N);
    for(int i=0;i<N;i++) cin>>prices[i];
    vector<long long> budgets(M);
    for(int i=0;i<M;i++) cin>>budgets[i];
    sort(prices.begin(), prices.end());
    vector<long long> pref(N);
    for(int i=0;i<N;i++) pref[i] = prices[i] + (i?pref[i-1]:0);
    for(int i=0;i<M;i++){
        long long b = budgets[i];
        int cnt = upper_bound(pref.begin(), pref.end(), b) - pref.begin();
        cout<<cnt<<"\n";
    }
    return 0;
}
