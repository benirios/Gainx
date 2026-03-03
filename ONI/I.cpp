#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int N; if(!(cin>>N)) return 0;
    vector<int> a(N+1);
    for(int i=1;i<=N;i++) cin>>a[i];
    vector<int> ans(N+1,0);
    vector<int> st; // store indices
    st.reserve(N);
    for(int i=1;i<=N;i++){
        while(!st.empty() && a[st.back()] >= a[i]) st.pop_back();
        ans[i] = st.empty()?0:st.back();
        st.push_back(i);
    }
    for(int i=1;i<=N;i++){
        if(i>1) cout<<" ";
        cout<<ans[i];
    }
    cout<<"\n";
    return 0;
}
