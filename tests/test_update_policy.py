import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

class UpdatePolicyTests(unittest.TestCase):
    def test_native_release_and_download_validation(self):
        root = Path(__file__).resolve().parents[1]
        javac = shutil.which('javac')
        ecj = os.environ.get('ECJ_JAR')
        if not javac and not ecj:
            self.skipTest('Requires javac or ECJ_JAR for native policy checks')
        with tempfile.TemporaryDirectory() as output:
            compile_args = [javac, '-d', output] if javac else ['java', '-jar', ecj, '-d', output, '-source', '11', '-target', '11']
            compile_args += [str(root / 'android/src/com/eightbittrade/tileforge/UpdatePolicy.java'), str(root / 'tests/java/UpdatePolicyTest.java')]
            subprocess.run(compile_args, check=True, capture_output=True, text=True)
            result = subprocess.run(['java', '-cp', output, 'UpdatePolicyTest'], check=True, capture_output=True, text=True)
            self.assertIn('checks passed', result.stdout)
