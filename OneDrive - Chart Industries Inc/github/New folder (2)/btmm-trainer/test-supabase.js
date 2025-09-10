// Supabase Connection Test Script
import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const supabaseUrl = 'https://uolvqeedmcesysqtsimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvbHZxZWVkbWNlc3lzcXRzaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMzgzOTksImV4cCI6MjA2ODcxNDM5OX0.uGapRAmG0VjSmKzqF-JIJ2z-R98xY13zJ2VYwLtWlLI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseSetup() {
  console.log('🔍 Testing Supabase Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase.from('trades').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Trades table not found or accessible');
      console.log('Error:', error.message);
      console.log('📝 You need to create the trades table in Supabase');
    } else {
      console.log('✅ Trades table exists and is accessible');
      console.log(`   Current record count: ${data || 0}`);
    }

    // Test 2: Case studies table
    console.log('\n2. Testing case_studies table...');
    const { data: caseData, error: caseError } = await supabase.from('case_studies').select('count', { count: 'exact', head: true });
    if (caseError) {
      console.log('❌ Case studies table not found or accessible');
      console.log('Error:', caseError.message);
      console.log('📝 You need to create the case_studies table in Supabase');
    } else {
      console.log('✅ Case studies table exists and is accessible');
      console.log(`   Current record count: ${caseData || 0}`);
    }

    // Test 3: Storage buckets
    console.log('\n3. Testing storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.log('❌ Error accessing storage buckets');
      console.log('Error:', bucketError.message);
    } else {
      console.log('✅ Storage accessible');
      const bucketNames = buckets.map(b => b.name);
      console.log('   Available buckets:', bucketNames);
      
      // Check for required buckets
      const requiredBuckets = ['trade-images', 'lesson-images'];
      requiredBuckets.forEach(bucket => {
        if (bucketNames.includes(bucket)) {
          console.log(`   ✅ ${bucket} bucket exists`);
        } else {
          console.log(`   ❌ ${bucket} bucket missing - needs to be created`);
        }
      });
    }

    // Test 4: Authentication
    console.log('\n4. Testing authentication...');
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ User authenticated:', user.email);
    } else {
      console.log('ℹ️  No user currently authenticated (this is normal for testing)');
    }

    console.log('\n🎯 SUMMARY:');
    console.log('If you see any ❌ errors above, you need to:');
    console.log('1. Sign in to your Supabase dashboard');
    console.log('2. Create the missing tables using the SQL provided earlier');
    console.log('3. Create the missing storage buckets');
    console.log('4. Set up Row Level Security (RLS) policies');

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('Check your Supabase URL and API key in .env.local');
  }
}

// Run the test
testSupabaseSetup();
